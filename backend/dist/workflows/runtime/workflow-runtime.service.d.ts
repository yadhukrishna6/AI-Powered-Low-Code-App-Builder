import { PrismaService } from '../../prisma/prisma.service';
import { NodeHandler } from './node-handler.interface';
export declare class WorkflowRuntimeService {
    private prisma;
    private readonly logger;
    private handlers;
    constructor(prisma: PrismaService);
    registerHandler(type: string, handler: NodeHandler): void;
    run(executionId: string): Promise<void>;
    private logNode;
    private updateExecutionStatus;
}
