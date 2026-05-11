// backend/src/workflows/dto/execution-state.dto.ts

import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsObject } from 'class-validator';

export class NodeExecutionStateDto {
  @IsString()
  nodeId: string;

  @IsEnum(['idle', 'queued', 'running', 'success', 'failed', 'skipped', 'waiting', 'cancelled'])
  state: string;

  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  error?: string;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsObject()
  output?: any;

  @IsOptional()
  @IsObject()
  input?: any;

  @IsOptional()
  @IsString()
  branchTaken?: string;
}

export class EdgeExecutionStateDto {
  @IsString()
  edgeId: string;

  @IsEnum(['inactive', 'active', 'success-path', 'failed-path', 'skipped-path'])
  state: string;

  @IsOptional()
  @IsDateString()
  executedAt?: string;

  @IsOptional()
  @IsNumber()
  executionCount?: number;

  @IsOptional()
  @IsString()
  branchType?: string;
}

export class WorkflowExecutionSnapshotDto {
  @IsString()
  executionId: string;

  @IsString()
  workflowId: string;

  @IsEnum(['idle', 'running', 'completed', 'failed', 'cancelled'])
  status: string;

  @IsDateString()
  startedAt: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsString()
  currentNodeId?: string;

  nodeStates: NodeExecutionStateDto[];

  edgeStates: EdgeExecutionStateDto[];

  @IsObject()
  variables: Record<string, any>;

  @IsNumber()
  progress: number;
}

export class ExecutionEventDto {
  @IsEnum(['node_started', 'node_completed', 'node_failed', 'edge_activated', 'execution_completed'])
  type: string;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsString()
  nodeId?: string;

  @IsOptional()
  @IsString()
  edgeId?: string;

  @IsOptional()
  @IsObject()
  data?: any;
}

export class StartExecutionDto {
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsString()
  triggerSource?: string;
}

export class ResumeExecutionDto {
  @IsEnum(['approve', 'reject'])
  action: 'approve' | 'reject';

  @IsOptional()
  @IsObject()
  data?: any;
}