// backend/src/workflows/runtime/enhanced-workflow-runtime.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NodeHandler, NodeResult, ExecutionContext } from './node-handler.interface';
import {
  NodeExecutionState,
  EdgeExecutionState,
  NodeExecutionMetadata,
  EdgeExecutionMetadata,
  WorkflowExecutionSnapshot
} from './execution-state.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class EnhancedWorkflowRuntimeService {
  private readonly logger = new Logger(EnhancedWorkflowRuntimeService.name);
  private handlers: Map<string, NodeHandler> = new Map();

  constructor(private prisma: PrismaService) {}

  registerHandler(type: string, handler: NodeHandler) {
    this.handlers.set(type, handler);
  }

  async executeWorkflow(workflowId: string, variables: Record<string, any> = {}): Promise<string> {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
        context: variables,
        startTime: new Date()
      }
    });

    this.runExecution(execution.id).catch(err => {
      this.logger.error(`Execution ${execution.id} failed:`, err);
    });

    return execution.id;
  }

  private async runExecution(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { workflow: true },
    });

    if (!execution) return;

    const graph = execution.workflow.graph as any;
    const context: ExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      variables: execution.context as Record<string, any>,
    };

    // Initialize in-memory execution state
    const nodeStates: NodeExecutionMetadata[] = graph.nodes.map((node: any) => ({
      nodeId: node.id,
      state: 'idle' as NodeExecutionState,
      retryCount: 0,
    }));

    const edgeStates: EdgeExecutionMetadata[] = graph.edges.map((edge: any) => ({
      edgeId: edge.id,
      state: 'inactive' as EdgeExecutionState,
      executionCount: 0,
      branchType: edge.sourceAnchor || edge.label || undefined,
    }));

    // Persist initial state snapshot
    await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

    // Find trigger node
    let currentNode = graph.nodes.find((n: any) =>
      n.type === 'trigger' || n.subType === 'start'
    );

    while (currentNode) {
      // Update node state to running
      this.setNodeState(nodeStates, currentNode.id, 'running', { startedAt: new Date() });
      await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

      const handler = this.handlers.get(currentNode.subType);

      if (!handler) {
        this.setNodeState(nodeStates, currentNode.id, 'failed', {
          error: `No handler found for ${currentNode.subType}`
        });
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }

      try {
        const result = await handler.execute(currentNode, context);
        const nodeState = this.mapNodeResultToState(result.status);

        this.setNodeState(nodeStates, currentNode.id, nodeState, {
          completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(nodeState) ? new Date() : undefined,
          error: result.error,
          output: result.output,
          branchTaken: result.nextPath,
        });

        // Log the execution step
        await this.logNode(executionId, currentNode, nodeState, result.output, result.error);

        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

        if (result.status === 'failed') {
          await this.updateExecutionStatus(executionId, 'failed', context.variables);
          return;
        }

        if (result.status === 'waiting') {
          await this.updateExecutionStatus(executionId, 'waiting', context.variables);
          return;
        }

        // Merge output into context variables
        if (result.output) {
          context.variables = { ...context.variables, ...result.output };
        }

        // Find next node based on edges and nextPath
        const edges = graph.edges.filter((e: any) => e.source === currentNode.id);

        if (edges.length === 0) break;

        let edge;
        if (result.nextPath) {
          edge = edges.find((e: any) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
          if (!edge) {
            this.setNodeState(nodeStates, currentNode.id, 'failed', {
              error: `No outgoing edge found for branch ${result.nextPath}`
            });
            await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;

        // Update edge state to active
        this.setEdgeState(edgeStates, edge.id, 'active', result.nextPath);
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error: any) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        this.setNodeState(nodeStates, currentNode.id, 'failed', { error: error.message });
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }
    }

    await this.updateExecutionStatus(executionId, 'success', context.variables);
  }

  async resumeExecution(executionId: string, action: 'approve' | 'reject'): Promise<void> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { workflow: true },
    });

    if (!execution || execution.status !== 'waiting') {
      throw new Error('Execution not in waiting state');
    }

    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        context: {
          ...(execution.context as Record<string, any>),
          resumeAction: action,
        },
      },
    });

    await this.resumeFromWaitingNode(executionId, action);
  }

  private async resumeFromWaitingNode(executionId: string, action: 'approve' | 'reject') {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { workflow: true },
    });

    if (!execution) return;

    const waitingLog = await this.prisma.workflowLog.findFirst({
      where: { executionId, status: 'waiting' },
      orderBy: { timestamp: 'desc' },
    });

    if (!waitingLog) return;

    const graph = execution.workflow.graph as any;
    const context: ExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      variables: { ...(execution.context as Record<string, any>), resumeAction: action },
    };

    // Restore state snapshot from result
    const snapshot = execution.result as any;
    const nodeStates: NodeExecutionMetadata[] = snapshot?.nodeStates || [];
    const edgeStates: EdgeExecutionMetadata[] = snapshot?.edgeStates || [];

    let currentNode = graph.nodes.find((n: any) => n.id === waitingLog.nodeId);
    if (!currentNode) return;

    await this.continueExecutionFromNode(executionId, currentNode, context, graph, nodeStates, edgeStates);
  }

  private async continueExecutionFromNode(
    executionId: string,
    currentNode: any,
    context: ExecutionContext,
    graph: any,
    nodeStates: NodeExecutionMetadata[],
    edgeStates: EdgeExecutionMetadata[]
  ) {
    while (currentNode) {
      this.setNodeState(nodeStates, currentNode.id, 'running', { startedAt: new Date() });
      await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

      const handler = this.handlers.get(currentNode.subType);

      if (!handler) {
        this.setNodeState(nodeStates, currentNode.id, 'failed', {
          error: `No handler found for ${currentNode.subType}`
        });
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }

      try {
        const result = await handler.execute(currentNode, context);
        const nodeState = this.mapNodeResultToState(result.status);

        this.setNodeState(nodeStates, currentNode.id, nodeState, {
          completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(nodeState) ? new Date() : undefined,
          error: result.error,
          output: result.output,
          branchTaken: result.nextPath,
        });

        await this.logNode(executionId, currentNode, nodeState, result.output, result.error);
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

        if (result.status === 'failed') {
          await this.updateExecutionStatus(executionId, 'failed', context.variables);
          return;
        }

        if (result.status === 'waiting') {
          await this.updateExecutionStatus(executionId, 'waiting', context.variables);
          return;
        }

        if (result.output) {
          context.variables = { ...context.variables, ...result.output };
        }

        const edges = graph.edges.filter((e: any) => e.source === currentNode.id);
        if (edges.length === 0) break;

        let edge;
        if (result.nextPath) {
          edge = edges.find((e: any) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
          if (!edge) {
            this.setNodeState(nodeStates, currentNode.id, 'failed', {
              error: `No outgoing edge found for branch ${result.nextPath}`
            });
            await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;

        this.setEdgeState(edgeStates, edge.id, 'active', result.nextPath);
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);

        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error: any) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        this.setNodeState(nodeStates, currentNode.id, 'failed', { error: error.message });
        await this.persistStateSnapshot(executionId, nodeStates, edgeStates);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }
    }

    await this.updateExecutionStatus(executionId, 'success', context.variables);
  }

  // ─── In-memory state helpers ────────────────────────────────────

  private setNodeState(
    states: NodeExecutionMetadata[],
    nodeId: string,
    state: NodeExecutionState,
    extra: Partial<NodeExecutionMetadata> = {}
  ) {
    const existing = states.find(s => s.nodeId === nodeId);
    if (existing) {
      Object.assign(existing, { state, ...extra });
    } else {
      states.push({ nodeId, state, retryCount: 0, ...extra });
    }
  }

  private setEdgeState(
    states: EdgeExecutionMetadata[],
    edgeId: string,
    state: EdgeExecutionState,
    branchType?: string
  ) {
    const existing = states.find(s => s.edgeId === edgeId);
    if (existing) {
      existing.state = state;
      existing.executedAt = new Date();
      existing.executionCount = (existing.executionCount || 0) + 1;
      if (branchType) existing.branchType = branchType;
    } else {
      states.push({ edgeId, state, executedAt: new Date(), executionCount: 1, branchType });
    }
  }

  // ─── Persistence helpers ────────────────────────────────────────

  /**
   * Stores the current node/edge execution states as a JSON snapshot
   * inside the WorkflowExecution.result field. This avoids needing
   * separate database tables for per-node/per-edge state.
   */
  private async persistStateSnapshot(
    executionId: string,
    nodeStates: NodeExecutionMetadata[],
    edgeStates: EdgeExecutionMetadata[]
  ) {
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        result: { nodeStates, edgeStates } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  private async logNode(
    executionId: string,
    node: any,
    status: string,
    output?: any,
    error?: string
  ) {
    await this.prisma.workflowLog.create({
      data: {
        executionId,
        nodeId: node.id,
        nodeType: node.subType || 'unknown',
        status,
        input: Prisma.JsonNull,
        output: output ? (output as Prisma.InputJsonValue) : Prisma.JsonNull,
        error,
      },
    });
  }

  private async updateExecutionStatus(
    executionId: string,
    status: string,
    context: any
  ) {
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status,
        context,
        endTime: ['success', 'failed'].includes(status) ? new Date() : null
      },
    });
  }

  private mapNodeResultToState(resultStatus: string): NodeExecutionState {
    switch (resultStatus) {
      case 'success': return 'success';
      case 'failed': return 'failed';
      case 'waiting': return 'waiting';
      case 'skipped': return 'skipped';
      default: return 'idle';
    }
  }

  async getExecutionState(executionId: string): Promise<WorkflowExecutionSnapshot | null> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
    });

    if (!execution) return null;

    // Read the state snapshot from the result JSON field
    const snapshot = (execution.result as any) || { nodeStates: [], edgeStates: [] };
    const nodeStates: NodeExecutionMetadata[] = snapshot.nodeStates || [];
    const edgeStates: EdgeExecutionMetadata[] = snapshot.edgeStates || [];

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status as any,
      startedAt: execution.startTime,
      completedAt: execution.endTime || undefined,
      currentNodeId: nodeStates.find(s => s.state === 'running')?.nodeId,
      nodeStates,
      edgeStates,
      variables: execution.context as Record<string, any>,
      progress: this.calculateProgress(nodeStates)
    };
  }

  private calculateProgress(nodeStates: NodeExecutionMetadata[]): number {
    if (nodeStates.length === 0) return 0;

    const completedStates: NodeExecutionState[] = ['success', 'failed', 'skipped'];
    const completed = nodeStates.filter(s => completedStates.includes(s.state)).length;

    return Math.round((completed / nodeStates.length) * 100);
  }
}