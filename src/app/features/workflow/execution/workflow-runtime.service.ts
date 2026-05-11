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

  async executeWorkflow(workflow: Workflow, variables: Record<string, any> = {}) {
    console.log('Starting execution for workflow:', workflow.id, variables);
    
    try {
      // 0. Auto-save to ensure the workflow exists in the DB
      await this.state.saveWorkflow();

      // 1. Get the canonical DB ID
      const dbId = this.state.getDbId();
      if (!dbId) {
        console.error('Cannot execute: workflow has no DB ID after save.');
        return;
      }

      // 2. Start execution on backend
      const execution = await firstValueFrom(
        this.http.post<{ id: string }>(`${this.apiUrl}/${dbId}/execute`, variables)
      );
      
      const context: WorkflowExecutionContext = {
        workflowId: dbId,
        instanceId: execution.id,
        variables: variables,
        history: [],
        status: 'active',
        startTime: new Date()
      };

      this.activeExecutionContext.set(context);

      // 3. Start polling for logs and status
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

        // 1. Derive execution history
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

        // 2. Update Node and Edge Statuses in State
        if (execution.logs) {
          const workflow = this.state.workflow();
          
          execution.logs.forEach((log: any) => {
            // Update node status
            this.state.updateNodeStatus(log.nodeId, log.status as ExecutionStatus, log.error);

            // Derive edge state
            const outgoingEdges = workflow.edges.filter(e => e.source === log.nodeId);
            
            if (log.status === 'success') {
              // If it's a success, highlight the path taken
              const nextPath = log.output?.nextPath; // Backend should provide this for branch nodes
              
              outgoingEdges.forEach(edge => {
                if (nextPath) {
                  // If we have a specific branch path (e.g. 'true'/'false'), highlight only that
                  const isTaken = edge.sourceAnchor === nextPath || edge.label === nextPath;
                  this.state.updateEdgeExecutionState(edge.id, isTaken ? 'success-path' : 'skipped-path');
                } else {
                  // Default path
                  this.state.updateEdgeExecutionState(edge.id, 'success-path');
                }
              });
            } else if (log.status === 'failed' || log.status === 'error') {
              // Mark outgoing edges as failed/inactive
              outgoingEdges.forEach(edge => {
                this.state.updateEdgeExecutionState(edge.id, 'failed-path');
              });
            } else if (log.status === 'running') {
              // Mark outgoing edges as active (pulsing soon?)
              outgoingEdges.forEach(edge => {
                this.state.updateEdgeExecutionState(edge.id, 'active');
              });
            }
          });
        }

        this.activeExecutionContext.update((ctx: WorkflowExecutionContext | null) =>
          ctx ? { ...ctx, history, status: execution.status === 'active' || execution.status === 'running' ? 'active' : execution.status === 'failed' ? 'failed' : 'completed' } : ctx
        );

        if (execution.status === 'success' || execution.status === 'failed' || execution.status === 'completed') {
          clearInterval(pollInterval);
          this.activeExecutionContext.update((ctx: WorkflowExecutionContext | null) => 
            ctx ? { ...ctx, status: execution.status as any, endTime: new Date() } : null
          );
          console.log(`Execution ${executionId} finished with status: ${execution.status}`);
        }

      } catch (e) {
        console.error('Polling error:', e);
        clearInterval(pollInterval);
      }
    }, 1000);
  }

  // Resume a paused workflow
  async resumeWorkflow(nodeId: string, action: 'approve' | 'reject') {
    const ctx = this.activeExecutionContext();
    if (!ctx) return;

    console.log(`Resuming workflow execution ${ctx.instanceId} with action ${action}`);
    
    try {
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/executions/${ctx.instanceId}/resume`, { action })
      );
    } catch (e) {
      console.error('Failed to resume workflow:', e);
    }
  }

  resetWorkflowStatus(workflow: Workflow) {
    workflow.nodes.forEach(n => {
      this.state.updateNodeStatus(n.id, 'idle');
    });
    this.state.resetExecutionStates();
  }

  clearExecution() {
    this.activeExecutionContext.set(null);
    this.state.resetExecutionStates();
  }
}
