import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { 
  Workflow, 
  WorkflowNode, 
  WorkflowExecutionContext, 
  NodeExecutionResult,
  ExecutionStatus 
} from '../models/workflow.model';
import { NodeRegistryService } from '../registry/node-registry.service';
import { WorkflowStateService } from '../services/workflow-state.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowRuntimeService {
  private http = inject(HttpClient);
  private registry = inject(NodeRegistryService);
  private state = inject(WorkflowStateService);
  private apiUrl = 'http://localhost:3000/api/v1/workflows';
  
  // Execution State
  activeExecutionContext = signal<WorkflowExecutionContext | null>(null);
  executionEvents$ = new Subject<NodeExecutionResult>();

  async executeWorkflow(workflow: Workflow) {
    console.log('Initiating backend workflow execution:', workflow.name);
    
    try {
      // 1. Start execution on backend
      const execution = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.apiUrl}/${workflow.id}/execute`, {})
      );
      
      const context: WorkflowExecutionContext = {
        workflowId: workflow.id,
        instanceId: execution.id,
        variables: {},
        history: [],
        status: 'active',
        startTime: new Date()
      };

      this.activeExecutionContext.set(context);

      // 2. Start polling for logs and status
      this.pollExecutionStatus(execution.id);

    } catch (e) {
      console.error('Failed to start execution:', e);
    }
  }

  private async pollExecutionStatus(executionId: string) {
    const pollInterval = setInterval(async () => {
      try {
        const execution = await firstValueFrom(
          this.http.get<{ status: string, logs: any[] }>(`${this.apiUrl}/executions/${executionId}`)
        );

        // Update node statuses in the UI based on logs and track execution history
        const history = execution.logs?.map((log: any) => {
          const messageParts: string[] = [];
          if (log.error) messageParts.push(log.error);
          if (log.output) messageParts.push(`Output: ${JSON.stringify(log.output)}`);

          return {
            nodeId: log.nodeId,
            timestamp: new Date(log.timestamp),
            success: log.status === 'success',
            input: log.input,
            output: log.output,
            error: log.error || undefined,
            message: messageParts.length > 0 ? messageParts.join(' | ') : undefined,
          };
        }) ?? [];

        if (execution.logs) {
          execution.logs.forEach((log: any) => {
            this.state.updateNodeStatus(log.nodeId, log.status as ExecutionStatus, log.error);
          });
        }

        this.activeExecutionContext.update((ctx: WorkflowExecutionContext | null) =>
          ctx ? { ...ctx, history, status: execution.status === 'active' ? 'active' : execution.status === 'failed' ? 'failed' : 'completed' } : ctx
        );

        if (execution.status === 'success' || execution.status === 'failed') {
          clearInterval(pollInterval);
          this.activeExecutionContext.update((ctx: WorkflowExecutionContext | null) => 
            ctx ? { ...ctx, endTime: new Date() } : null
          );
          console.log(`Execution ${executionId} finished with status: ${execution.status}`);
        }

      } catch (e) {
        console.error('Polling error:', e);
        clearInterval(pollInterval);
      }
    }, 1000);
  }

  // Resume a paused workflow (needed for UI compatibility)
  async resumeWorkflow(nodeId: string, action: 'approve' | 'reject') {
    console.log(`Resuming workflow at ${nodeId} with action ${action}`);
    // Find the active execution
    const execution = this.activeExecutionContext();
    if (!execution || execution.status !== 'active') return;

    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/executions/${execution.instanceId}/resume`, { action })
      );
      console.log('Workflow resumed successfully');
    } catch (e) {
      console.error('Failed to resume workflow:', e);
    }
  }

  resetWorkflowStatus(workflow: Workflow) {
    workflow.nodes.forEach(n => {
      this.state.updateNodeStatus(n.id, 'idle');
    });
  }
}
