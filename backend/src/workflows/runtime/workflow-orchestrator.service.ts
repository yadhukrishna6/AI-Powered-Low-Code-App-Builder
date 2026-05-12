import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowOrchestrator {
  private readonly logger = new Logger(WorkflowOrchestrator.name);

  constructor(
    @InjectQueue('workflow-queue') private workflowQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async startExecution(executionId: string) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id: executionId },
      include: { version: true },
    });

    if (!execution || !execution.version) {
      throw new Error(`Execution ${executionId} or version not found`);
    }

    const graph = execution.version.graph as any;
    const startNode = graph.nodes.find(
      (n: any) => n.type === 'trigger' || n.subType === 'start' || n.subType === 'form-submitted'
    );

    if (!startNode) {
      throw new Error('No trigger node found in workflow graph');
    }

    this.logger.log(`Queueing trigger node ${startNode.id} for execution ${executionId}`);

    await this.workflowQueue.add('execute-node', {
      executionId,
      nodeId: startNode.id,
    }, {
      jobId: `${executionId}-${startNode.id}`,
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }

  async queueNode(executionId: string, nodeId: string, delay = 0) {
    await this.workflowQueue.add('execute-node', {
      executionId,
      nodeId,
    }, {
      jobId: `${executionId}-${nodeId}-${Date.now()}`, // Allow multiple executions of same node (loops)
      delay,
      removeOnComplete: true,
    });
  }
}
