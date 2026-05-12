import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
export declare class WorkflowOrchestrator {
    private workflowQueue;
    private prisma;
    private readonly logger;
    constructor(workflowQueue: Queue, prisma: PrismaService);
    startExecution(executionId: string): Promise<void>;
    queueNode(executionId: string, nodeId: string, delay?: number): Promise<void>;
}
