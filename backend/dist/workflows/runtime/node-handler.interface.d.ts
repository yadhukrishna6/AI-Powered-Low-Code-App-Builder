export interface ExecutionContext {
    executionId: string;
    workflowId: string;
    variables: Record<string, any>;
}
export interface NodeResult {
    status: 'success' | 'failed' | 'waiting';
    output?: any;
    error?: string;
    nextPath?: string;
}
export interface NodeHandler {
    execute(node: any, context: ExecutionContext): Promise<NodeResult>;
}
