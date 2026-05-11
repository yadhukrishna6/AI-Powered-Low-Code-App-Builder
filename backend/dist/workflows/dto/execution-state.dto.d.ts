export declare class NodeExecutionStateDto {
    nodeId: string;
    state: string;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    error?: string;
    retryCount?: number;
    output?: any;
    input?: any;
    branchTaken?: string;
}
export declare class EdgeExecutionStateDto {
    edgeId: string;
    state: string;
    executedAt?: string;
    executionCount?: number;
    branchType?: string;
}
export declare class WorkflowExecutionSnapshotDto {
    executionId: string;
    workflowId: string;
    status: string;
    startedAt: string;
    completedAt?: string;
    currentNodeId?: string;
    nodeStates: NodeExecutionStateDto[];
    edgeStates: EdgeExecutionStateDto[];
    variables: Record<string, any>;
    progress: number;
}
export declare class ExecutionEventDto {
    type: string;
    timestamp: string;
    nodeId?: string;
    edgeId?: string;
    data?: any;
}
export declare class StartExecutionDto {
    variables?: Record<string, any>;
    triggerSource?: string;
}
export declare class ResumeExecutionDto {
    action: 'approve' | 'reject';
    data?: any;
}
