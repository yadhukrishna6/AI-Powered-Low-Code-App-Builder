export type WorkflowNodeType = 'trigger' | 'logic' | 'action';
export type ExecutionStatus = 'idle' | 'queued' | 'running' | 'success' | 'error' | 'failed' | 'skipped' | 'waiting' | 'cancelled';
export type EdgeExecutionState = 'inactive' | 'active' | 'success-path' | 'failed-path' | 'skipped-path';

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
  executionDuration?: number; // ms
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceAnchor?: string; // e.g., 'true', 'false', 'default'
  targetAnchor?: string;
  label?: string;
  color?: string;
  type?: 'default' | 'success' | 'failure' | 'conditional';
  executionState?: EdgeExecutionState;
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
