export type WorkflowNodeType = 'trigger' | 'logic' | 'action';
export type ExecutionStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped' | 'waiting';

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
  status: ExecutionStatus;
  errorMessage?: string;
  lastExecuted?: Date;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceAnchor?: string; // e.g., 'true', 'false', 'default'
  targetAnchor?: string;
  label?: string;
  type?: 'default' | 'success' | 'failure' | 'conditional';
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  zoom: number;
  pan: Position;
  metadata: {
    version: string;
    lastSaved: string; // ISO string for easier JSON serialization
    createdBy?: string;
    description?: string;
  };
}

export interface WorkflowExecutionContext {
  workflowId: string;
  instanceId: string; // unique ID for this specific run
  variables: Record<string, any>;
  history: NodeExecutionResult[];
  status: 'active' | 'completed' | 'failed' | 'suspended';
  startTime: Date;
  endTime?: Date;
}

export interface NodeExecutionResult {
  nodeId: string;
  timestamp: Date;
  success: boolean;
  input?: any;
  output?: any;
  error?: string;
  duration?: number; // ms
}
