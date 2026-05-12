import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NodeHandler, NodeResult, ExecutionContext } from './node-handler.interface';

@Injectable()
export class WorkflowRuntimeService {
  private readonly logger = new Logger(WorkflowRuntimeService.name);
  private handlers: Map<string, NodeHandler> = new Map();

  constructor(private prisma: PrismaService) {}

  registerHandler(type: string, handler: NodeHandler) {
    this.handlers.set(type, handler);
  }

  getHandler(type: string): NodeHandler | undefined {
    return this.handlers.get(type);
  }

  async run(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { version: true },
    });

    if (!execution || !execution.version) {
      this.logger.error(`Execution ${executionId} or its version not found`);
      return;
    }

    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'running' },
    });

    const graph = execution.version.graph as any;
    const context: ExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      variables: execution.context as Record<string, any>,
    };

    // Find trigger node (assume first node for now if not specified)
    let currentNode = graph.nodes.find((n: any) => n.type === 'trigger' || n.subType === 'start');
    
    while (currentNode) {
      this.logger.log(`Executing node: ${currentNode.id} (${currentNode.subType})`);
      
      const handler = this.handlers.get(currentNode.subType);
      
      if (!handler) {
        await this.logNode(executionId, currentNode, 'failed', null, null, `No handler found for ${currentNode.subType}`);
        break;
      }

      try {
        const result = await handler.execute(currentNode, context);
        await this.logNode(executionId, currentNode, result.status, null, result.output, result.error);

        if (result.status === 'failed') {
          await this.updateExecutionStatus(executionId, 'failed', context.variables);
          return;
        }

        if (result.status === 'waiting') {
          this.logger.log(`Workflow ${executionId} reached a waiting state at node ${currentNode.id}`);
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
            await this.logNode(executionId, currentNode, 'failed', null, null, `No outgoing edge found for branch ${result.nextPath}`);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;
        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        await this.logNode(executionId, currentNode, 'failed', null, null, error.message);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }
    }

    await this.updateExecutionStatus(executionId, 'success', context.variables);
  }

  private async logNode(executionId: string, node: any, status: string, input: any, output: any, error?: string) {
    await this.prisma.workflowLog.create({
      data: {
        executionId,
        nodeId: node.id,
        nodeType: node.subType,
        status,
        input: input || {},
        output: output || {},
        error,
      },
    });
  }

  private async updateExecutionStatus(executionId: string, status: string, context: any) {
    await this.prisma.workflowExecution.update({
      where: { id: executionId },
      data: { 
        status, 
        context,
        endTime: status === 'success' || status === 'failed' ? new Date() : null
      },
    });
  }

  async resume(executionId: string, action: 'approve' | 'reject') {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { version: true },
    });

    if (!execution || !execution.version) return;
    if (execution.status !== 'waiting' && execution.status !== 'running' && execution.status !== 'active') return;

    const graph = execution.version.graph as any;
    const context: ExecutionContext = {
      executionId,
      workflowId: execution.workflowId,
      variables: { ...(execution.context as Record<string, any>), resumeAction: action },
    };

    // Find the waiting node from logs
    const lastLog = await this.prisma.workflowLog.findFirst({
      where: { executionId, status: 'waiting' },
      orderBy: { timestamp: 'desc' },
    });

    if (!lastLog) return;

    let currentNode = graph.nodes.find((n: any) => n.id === lastLog.nodeId);
    if (!currentNode) return;

    // Continue execution from the waiting node with the action
    while (currentNode) {
      this.logger.log(`Resuming node: ${currentNode.id} (${currentNode.subType})`);
      
      const handler = this.handlers.get(currentNode.subType);
      
      if (!handler) {
        await this.logNode(executionId, currentNode, 'failed', null, null, `No handler found for ${currentNode.subType}`);
        break;
      }

      try {
        const result = await handler.execute(currentNode, context);
        await this.logNode(executionId, currentNode, result.status, null, result.output, result.error);

        if (result.status === 'failed') {
          await this.updateExecutionStatus(executionId, 'failed', context.variables);
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
            await this.logNode(executionId, currentNode, 'failed', null, null, `No outgoing edge found for branch ${result.nextPath}`);
            await this.updateExecutionStatus(executionId, 'failed', context.variables);
            return;
          }
        } else {
          edge = edges[0];
        }

        if (!edge) break;
        currentNode = graph.nodes.find((n: any) => n.id === edge.target);

      } catch (error) {
        this.logger.error(`Error in node ${currentNode.id}: ${error.message}`);
        await this.logNode(executionId, currentNode, 'failed', null, null, error.message);
        await this.updateExecutionStatus(executionId, 'failed', context.variables);
        return;
      }
    }

    await this.updateExecutionStatus(executionId, 'success', context.variables);
  }
}
