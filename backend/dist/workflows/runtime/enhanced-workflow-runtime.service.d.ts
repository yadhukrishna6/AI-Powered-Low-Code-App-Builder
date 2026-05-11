import { PrismaService } from '../../prisma/prisma.service';
import { NodeHandler } from './node-handler.interface';
import { WorkflowExecutionSnapshot } from './execution-state.interface';
export declare class EnhancedWorkflowRuntimeService {
    private prisma;
    private readonly logger;
    private handlers;
    constructor(prisma: PrismaService);
    registerHandler(type: string, handler: NodeHandler): void;
    executeWorkflow(workflowId: string, variables?: Record<string, any>): Promise<string>;
    private runExecution;
    resumeExecution(executionId: string, action: 'approve' | 'reject'): Promise<void>;
    private resumeFromWaitingNode;
    private continueExecutionFromNode;
    private setNodeState;
    private setEdgeState;
    private persistStateSnapshot;
    private logNode;
    private updateExecutionStatus;
    private mapNodeResultToState;
    getExecutionState(executionId: string): Promise<WorkflowExecutionSnapshot | null>;
    private calculateProgress;
}
