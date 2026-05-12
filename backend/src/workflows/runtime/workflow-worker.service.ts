import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkflowRuntimeService } from './workflow-runtime.service';
import { WorkflowOrchestrator } from './workflow-orchestrator.service';
import { WorkflowGateway } from './workflow.gateway';
import { ExecutionContext } from './node-handler.interface';
import { ExpressionResolverService } from './expression-resolver.service';

@Processor('workflow-queue')
export class WorkflowWorker extends WorkerHost {
  private readonly logger = new Logger(WorkflowWorker.name);

  constructor(
    private prisma: PrismaService,
    private runtime: WorkflowRuntimeService,
    private orchestrator: WorkflowOrchestrator,
    private gateway: WorkflowGateway,
    private expressionResolver: ExpressionResolverService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { executionId, nodeId } = job.data;
    
    this.logger.log(`Processing node ${nodeId} for execution ${executionId}`);

    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { version: true },
    });

    if (!execution || !execution.version) return;

    // Update execution status if it was queued
    if (execution.status === 'queued') {
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'running' },
      });
    }

    const graph = execution.version.graph as any;
    const node = graph.nodes.find((n: any) => n.id === nodeId);

    if (!node) {
      this.logger.error(`Node ${nodeId} not found in graph`);
      return;
    }

    // Emit live update: node running
    this.gateway.sendNodeExecutionUpdate(executionId, nodeId, 'running');

    // Prepare Context (n8n style: track node outputs)
    const context: ExecutionContext = {
      executionId,
      workflowId: (execution as any).workflowId,
      variables: execution.context as Record<string, any>,
      lastOutput: (execution as any).lastOutput || {},
      nodeOutputs: (execution as any).nodeOutputs || {},
    };

    // 3. Resolve Expressions in Node Data (n8n style)
    const resolvedData = this.expressionResolver.resolve(node.data, context);

    try {
      // Execute handler with resolved data
      const handler = this.runtime.getHandler(node.subType);
      if (!handler) {
        throw new Error(`No handler found for ${node.subType}`);
      }

      const result = await handler.execute({ ...node, data: resolvedData }, context);

      // Emit live update: node status
      this.gateway.sendNodeExecutionUpdate(executionId, nodeId, result.status, result.output);

      // Handle Retry
      if (result.status === 'retry') {
        this.logger.log(`Node ${nodeId} requested retry. Queueing with delay ${result.retryDelay || 1000}ms`);
        
        // Update variables if needed for retry count
        if (result.output) {
          await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: { context: { ...context.variables, ...result.output } },
          });
        }

        await this.orchestrator.queueNode(executionId, nodeId, result.retryDelay || 1000);
        return;
      }

      // Log execution
      await this.prisma.workflowLog.create({
        data: {
          executionId,
          nodeId: node.id,
          nodeType: node.subType,
          status: result.status,
          input: node.data || {},
          output: result.output || {},
          error: result.error,
        },
      });

      if (result.status === 'failed') {
        const edges = graph.edges.filter((e: any) => e.source === nodeId);
        const failureEdge = edges.find(
          (e: any) => e.sourceHandle === 'failure' || e.sourceAnchor === 'failure'
        );

        if (failureEdge) {
          this.logger.log(`Node ${nodeId} failed. Redirecting to failure branch.`);
          await this.orchestrator.queueNode(executionId, failureEdge.target);
          return;
        }

        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: { status: 'failed' },
        });
        this.gateway.sendExecutionStatusUpdate(executionId, 'failed');
        return;
      }

      if (result.status === 'waiting') {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: { status: 'waiting' },
        });
        this.gateway.sendExecutionStatusUpdate(executionId, 'waiting');
        return;
      }

      // Update context variables
      if (result.output) {
        const updatedVariables = { ...context.variables, ...result.output };
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: { context: updatedVariables },
        });
      }

      // Find next nodes
      const edges = graph.edges.filter((e: any) => e.source === nodeId);
      let nextEdges: any[] = [];

      if (result.nextPath) {
        nextEdges = edges.filter(
          (e: any) => e.sourceHandle === result.nextPath || e.sourceAnchor === result.nextPath
        );
      } else {
        // Default behavior: follow first edge that is NOT failure or other specific handle
        nextEdges = edges.filter(
          (e: any) => !e.sourceHandle || (e.sourceHandle !== 'failure' && e.sourceHandle !== 'false' && e.sourceHandle !== 'rejected')
        ).slice(0, 1);
      }

      for (const edge of nextEdges) {
        await this.orchestrator.queueNode(executionId, edge.target);
      }

      // If no next edges and it's not a waiting/failed node, check if workflow is finished
      if (nextEdges.length === 0) {
        await this.prisma.workflowExecution.update({
          where: { id: executionId },
          data: { 
            status: 'success',
            endTime: new Date()
          },
        });
        this.gateway.sendExecutionStatusUpdate(executionId, 'success');
      }

    } catch (error) {
      this.logger.error(`Error executing node ${nodeId}: ${error.message}`);
      
      await this.prisma.workflowLog.create({
        data: {
          executionId,
          nodeId: node.id,
          nodeType: node.subType,
          status: 'failed',
          error: error.message,
        },
      });

      // Check for failure branch in case of exception
      const edges = graph.edges.filter((e: any) => e.source === nodeId);
      const failureEdge = edges.find(
        (e: any) => e.sourceHandle === 'failure' || e.sourceAnchor === 'failure'
      );

      if (failureEdge) {
        this.logger.log(`Exception in node ${nodeId}. Redirecting to failure branch.`);
        await this.orchestrator.queueNode(executionId, failureEdge.target);
        return;
      }
      
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: 'failed', endTime: new Date() },
      });
      this.gateway.sendExecutionStatusUpdate(executionId, 'failed');
      
      throw error; 
    }
  }
}
