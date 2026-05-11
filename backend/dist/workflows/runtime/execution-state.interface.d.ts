export type NodeExecutionState = 'idle' | 'queued' | 'running' | 'success' | 'failed' | 'skipped' | 'waiting' | 'cancelled';
export type EdgeExecutionState = 'inactive' | 'active' | 'success-path' | 'failed-path' | 'skipped-path';
export interface NodeExecutionMetadata {
    nodeId: string;
    state: NodeExecutionState;
    startedAt?: Date;
    completedAt?: Date;
    duration?: number;
    error?: string;
    retryCount?: number;
    output?: any;
    input?: any;
    branchTaken?: string;
}
export interface EdgeExecutionMetadata {
    edgeId: string;
    state: EdgeExecutionState;
    executedAt?: Date;
    executionCount?: number;
    branchType?: string;
}
export interface WorkflowExecutionSnapshot {
    executionId: string;
    workflowId: string;
    status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
    startedAt: Date;
    completedAt?: Date;
    currentNodeId?: string;
    nodeStates: NodeExecutionMetadata[];
    edgeStates: EdgeExecutionMetadata[];
    variables: Record<string, any>;
    progress: number;
}
export interface ExecutionEvent {
    type: 'node_started' | 'node_completed' | 'node_failed' | 'edge_activated' | 'execution_completed';
    timestamp: Date;
    nodeId?: string;
    edgeId?: string;
    data?: any;
}
