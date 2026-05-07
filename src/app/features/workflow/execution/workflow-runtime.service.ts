import { Injectable, inject, signal } from '@angular/core';
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
  private registry = inject(NodeRegistryService);
  private state = inject(WorkflowStateService);
  
  // Execution State
  activeExecutionContext = signal<WorkflowExecutionContext | null>(null);
  executionEvents$ = new Subject<NodeExecutionResult>();

  async executeWorkflow(workflow: Workflow, startNodeId?: string) {
    console.log('Starting workflow execution:', workflow.name);
    
    const context: WorkflowExecutionContext = {
      workflowId: workflow.id,
      instanceId: Math.random().toString(36).substring(7),
      variables: {},
      history: [],
      status: 'active',
      startTime: new Date()
    };

    this.activeExecutionContext.set(context);

    // Find trigger nodes if no startNodeId provided
    const triggers = startNodeId 
      ? workflow.nodes.filter(n => n.id === startNodeId)
      : workflow.nodes.filter(n => n.type === 'trigger');

    for (const trigger of triggers) {
      await this.executeNode(trigger, workflow, context);
    }

    context.status = 'completed';
    context.endTime = new Date();
    this.activeExecutionContext.set({ ...context });
  }

  private async executeNode(
    node: WorkflowNode, 
    workflow: Workflow, 
    context: WorkflowExecutionContext
  ) {
    const startTime = Date.now();
    
    // Update visual status
    this.state.updateNodeStatus(node.id, 'running');
    
    try {
      // Simulate execution delay based on type
      await this.simulateNodeExecution(node);
      
      const result: NodeExecutionResult = {
        nodeId: node.id,
        timestamp: new Date(),
        success: true,
        duration: Date.now() - startTime
      };

      this.state.updateNodeStatus(node.id, 'success');
      context.history.push(result);
      this.executionEvents$.next(result);

      // Find next nodes via edges
      const outgoingEdges = workflow.edges.filter(e => e.source === node.id);
      
      for (const edge of outgoingEdges) {
        const nextNode = workflow.nodes.find(n => n.id === edge.target);
        if (nextNode) {
          // In a real engine, we might check condition edge logic here
          await this.executeNode(nextNode, workflow, context);
        }
      }

    } catch (error: any) {
      this.state.updateNodeStatus(node.id, 'error', error.message);
      
      const result: NodeExecutionResult = {
        nodeId: node.id,
        timestamp: new Date(),
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
      
      context.history.push(result);
      this.executionEvents$.next(result);
      context.status = 'failed';
    }
  }

  private async simulateNodeExecution(node: WorkflowNode) {
    const delay = node.type === 'action' ? 1500 : 800;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  resetWorkflowStatus(workflow: Workflow) {
    workflow.nodes.forEach(n => {
      this.state.updateNodeStatus(n.id, 'idle');
    });
  }
}
