// backend/src/workflows/runtime/execution-state.interface.ts

export type NodeExecutionState =
  | 'idle'           // Default state, not executed
  | 'queued'         // In execution queue, waiting to run
  | 'running'        // Currently executing
  | 'success'        // Completed successfully
  | 'failed'         // Failed with error
  | 'skipped'        // Skipped due to conditional logic
  | 'waiting'        // Waiting for user input (approval, etc.)
  | 'cancelled';     // Execution was cancelled

export type EdgeExecutionState =
  | 'inactive'       // Not yet executed
  | 'active'         // Currently executing along this path
  | 'success-path'   // Part of successful execution path
  | 'failed-path'    // Part of failed execution path
  | 'skipped-path';  // Path was skipped

export interface NodeExecutionMetadata {
  nodeId: string;
  state: NodeExecutionState;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  error?: string;
  retryCount?: number;
  output?: any;
  input?: any;
  branchTaken?: string; // For condition nodes: 'true', 'false', etc.
}

export interface EdgeExecutionMetadata {
  edgeId: string;
  state: EdgeExecutionState;
  executedAt?: Date;
  executionCount?: number;
  branchType?: string; // 'true', 'false', 'default', etc.
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
  progress: number; // 0-100
}

export interface ExecutionEvent {
  type: 'node_started' | 'node_completed' | 'node_failed' | 'edge_activated' | 'execution_completed';
  timestamp: Date;
  nodeId?: string;
  edgeId?: string;
  data?: any;
}