export interface ExecutionContext {
    executionId: string;
    workflowId: string;
    variables: Record<string, any>;
    lastOutput?: any;
    nodeOutputs?: Record<string, any>;
    loopContext?: {
        index: number;
        total: number;
        item: any;
        collectionKey: string;
    };
}
export interface NodeResult {
    status: 'success' | 'failed' | 'waiting' | 'skipped' | 'retry';
    output?: any;
    error?: string;
    nextPath?: string;
    retryDelay?: number;
}
export interface NodeHandler {
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
