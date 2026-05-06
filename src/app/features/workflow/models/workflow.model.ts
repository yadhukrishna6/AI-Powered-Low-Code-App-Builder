export type WorkflowNodeType = 'trigger' | 'logic' | 'action';

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode<T = any> {
  id: string;
  type: WorkflowNodeType;
  subType: string;
  label: string;
  position: Position;
  data: T;
  status?: 'idle' | 'running' | 'success' | 'error';
  errorMessage?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
  data?: any;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: {
    version: string;
    lastSaved: Date;
    createdBy?: string;
  };
}

export interface WorkflowExecutionContext {
  workflowId: string;
  variables: Record<string, any>;
  executionPath: string[];
  currentNodeId?: string;
  status: 'active' | 'completed' | 'failed' | 'suspended';
}

export interface NodeExecutionResult {
  nodeId: string;
  success: boolean;
  output?: any;
  error?: string;
  nextNodes?: string[]; // IDs of nodes to proceed to (for branching)
}
