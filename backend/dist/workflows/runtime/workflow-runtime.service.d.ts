import { PrismaService } from '../../prisma/prisma.service';
import { NodeHandler } from './node-handler.interface';
export declare class WorkflowRuntimeService {
    private prisma;
    private readonly logger;
    private handlers;
    constructor(prisma: PrismaService);
    registerHandler(type: string, handler: NodeHandler): void;
    getHandler(type: string): NodeHandler | undefined;
    run(executionId: string): Promise<void>;
    private logNode;
    private updateExecutionStatus;
    resume(executionId: string, action: 'approve' | 'reject'): Promise<void>;
}
