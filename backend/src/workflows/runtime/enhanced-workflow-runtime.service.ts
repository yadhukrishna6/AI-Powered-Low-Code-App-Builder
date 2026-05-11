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

@Injectable()
export class EnhancedWorkflowRuntimeService {
  private readonly logger = new Logger(EnhancedWorkflowRuntimeService.name);
  private handlers: Map<string, NodeHandler> = new Map();

  constructor(private prisma: PrismaService) {}

  registerHandler(type: string, handler: NodeHandler) {
    this.handlers.set(type, handler);
  }

  async executeWorkflow(workflowId: string, variables: Record<string, any> = {}): Promise<string> {
    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
        context: variables,
        startTime: new Date()
      }
    });

    // Start execution asynchronously
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

    // Initialize execution state
    await this.initializeExecutionState(executionId, graph);

    // Find trigger node
    let currentNode = graph.nodes.find((n: any) =>
      n.type === 'trigger' || n.subType === 'start'
    );

    while (currentNode) {
      // Update node state to running
      await this.updateNodeExecutionState(executionId, currentNode.id, 'running');

      const handler = this.handlers.get(currentNode.subType);

      if (!handler) {
        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed',
          `No handler found for ${currentNode.subType}`);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }

      try {
        const result = await handler.execute(currentNode, context);

        // Update node state based on result
        const nodeState = this.mapNodeResultToState(result.status);
        await this.updateNodeExecutionState(executionId, currentNode.id, nodeState,
          result.error, result.output, result.nextPath);

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
            await this.updateNodeExecutionState(executionId, currentNode.id, 'failed',
              `No outgoing edge found for branch ${result.nextPath}`);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;

        // Update edge state to active
        await this.updateEdgeExecutionState(executionId, edge.id, 'active', result.nextPath);

        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', error.message);
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

    // Update execution with resume action
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

    // Continue execution from waiting node
    await this.resumeFromWaitingNode(executionId, action);
  }

  private async resumeFromWaitingNode(executionId: string, action: 'approve' | 'reject') {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { workflow: true },
    });

    if (!execution) return;

    // Find the waiting node from execution logs
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

    let currentNode = graph.nodes.find((n: any) => n.id === waitingLog.nodeId);
    if (!currentNode) return;

    // Continue execution from this node
    await this.continueExecutionFromNode(executionId, currentNode, context, graph);
  }

  private async continueExecutionFromNode(
    executionId: string,
    currentNode: any,
    context: ExecutionContext,
    graph: any
  ) {
    while (currentNode) {
      await this.updateNodeExecutionState(executionId, currentNode.id, 'running');

      const handler = this.handlers.get(currentNode.subType);

      if (!handler) {
        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed',
          `No handler found for ${currentNode.subType}`);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }

      try {
        const result = await handler.execute(currentNode, context);

        const nodeState = this.mapNodeResultToState(result.status);
        await this.updateNodeExecutionState(executionId, currentNode.id, nodeState,
          result.error, result.output, result.nextPath);

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

        // Find next node
        const edges = graph.edges.filter((e: any) => e.source === currentNode.id);
        if (edges.length === 0) break;

        let edge;
        if (result.nextPath) {
          edge = edges.find((e: any) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath);
          if (!edge) {
            await this.updateNodeExecutionState(executionId, currentNode.id, 'failed',
              `No outgoing edge found for branch ${result.nextPath}`);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;

        await this.updateEdgeExecutionState(executionId, edge.id, 'active', result.nextPath);
        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        await this.updateNodeExecutionState(executionId, currentNode.id, 'failed', error.message);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }
    }

    await this.updateExecutionStatus(executionId, 'success', context.variables);
  }

  private async initializeExecutionState(executionId: string, graph: any) {
    // Create initial execution state records
    const nodeStates = graph.nodes.map((node: any) => ({
      executionId,
      nodeId: node.id,
      state: 'idle' as NodeExecutionState,
      startedAt: null,
      completedAt: null,
      duration: null,
      error: null,
      retryCount: 0,
      output: null,
      input: null,
      branchTaken: null
    }));

    const edgeStates = graph.edges.map((edge: any) => ({
      executionId,
      edgeId: edge.id,
      state: 'inactive' as EdgeExecutionState,
      executedAt: null,
      executionCount: 0,
      branchType: edge.sourceAnchor || edge.label || null
    }));

    await this.prisma.executionNodeState.createMany({ data: nodeStates });
    await this.prisma.executionEdgeState.createMany({ data: edgeStates });
  }

  private async updateNodeExecutionState(
    executionId: string,
    nodeId: string,
    state: NodeExecutionState,
    error?: string,
    output?: any,
    branchTaken?: string
  ) {
    const now = new Date();

    await this.prisma.executionNodeState.upsert({
      where: {
        executionId_nodeId: { executionId, nodeId }
      },
      update: {
        state,
        completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? now : null,
        duration: state === 'running' ? null : undefined, // Will be calculated
        error,
        output,
        branchTaken
      },
      create: {
        executionId,
        nodeId,
        state,
        startedAt: state === 'running' ? now : null,
        completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? now : null,
        error,
        output,
        branchTaken
      }
    });

    // Log the execution step
    await this.prisma.workflowLog.create({
      data: {
        executionId,
        nodeId,
        nodeType: 'unknown', // Will be updated by handler
        status: state,
        input: null,
        output,
        error
      }
    });
  }

  private async updateEdgeExecutionState(
    executionId: string,
    edgeId: string,
    state: EdgeExecutionState,
    branchType?: string
  ) {
    await this.prisma.executionEdgeState.upsert({
      where: {
        executionId_edgeId: { executionId, edgeId }
      },
      update: {
        state,
        executedAt: new Date(),
        executionCount: { increment: 1 },
        branchType
      },
      create: {
        executionId,
        edgeId,
        state,
        executedAt: new Date(),
        executionCount: 1,
        branchType
      }
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
      include: {
        nodeStates: true,
        edgeStates: true
      }
    });

    if (!execution) return null;

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status as any,
      startedAt: execution.startTime,
      completedAt: execution.endTime || undefined,
      currentNodeId: execution.nodeStates.find(s => s.state === 'running')?.nodeId,
      nodeStates: execution.nodeStates.map(s => ({
        nodeId: s.nodeId,
        state: s.state as NodeExecutionState,
        startedAt: s.startedAt || undefined,
        completedAt: s.completedAt || undefined,
        duration: s.duration || undefined,
        error: s.error || undefined,
        retryCount: s.retryCount,
        output: s.output,
        input: s.input,
        branchTaken: s.branchTaken || undefined
      })),
      edgeStates: execution.edgeStates.map(s => ({
        edgeId: s.edgeId,
        state: s.state as EdgeExecutionState,
        executedAt: s.executedAt || undefined,
        executionCount: s.executionCount,
        branchType: s.branchType || undefined
      })),
      variables: execution.context as Record<string, any>,
      progress: this.calculateProgress(execution.nodeStates)
    };
  }

  private calculateProgress(nodeStates: any[]): number {
    if (nodeStates.length === 0) return 0;

    const completedStates = ['success', 'failed', 'skipped'];
    const completed = nodeStates.filter(s => completedStates.includes(s.state)).length;

    return Math.round((completed / nodeStates.length) * 100);
  }
}