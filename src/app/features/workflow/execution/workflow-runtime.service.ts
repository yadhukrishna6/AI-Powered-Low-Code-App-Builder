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

      // Branching logic for 'condition' nodes
      let outgoingEdges = workflow.edges.filter(e => e.source === node.id);
      
      if (node.subType === 'condition') {
        const conditionResult = this.evaluateCondition(node, context);
        // If true, follow the 'true' branch (we'll assume the first edge is true for simplicity, 
        // or match by targetAnchor if implemented)
        if (conditionResult) {
          outgoingEdges = outgoingEdges.filter(e => e.targetAnchor === 'true' || outgoingEdges.indexOf(e) === 0);
        } else {
          outgoingEdges = outgoingEdges.filter(e => e.targetAnchor === 'false' || outgoingEdges.indexOf(e) === 1);
        }
      }

      // Handle 'approval' nodes (pause execution)
      if (node.subType === 'approval') {
        this.state.updateNodeStatus(node.id, 'waiting');
        console.log('Workflow paused: Waiting for approval at', node.id);
        return; // Pause traversal
      }
      
      for (const edge of outgoingEdges) {
        const nextNode = workflow.nodes.find(n => n.id === edge.target);
        if (nextNode) {
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

  private evaluateCondition(node: WorkflowNode, context: WorkflowExecutionContext): boolean {
    const { variable, operator, value } = node.data;
    const actualValue = context.variables[variable] || 0;
    
    switch (operator) {
      case 'gt': return actualValue > value;
      case 'lt': return actualValue < value;
      case 'eq': return actualValue === value;
      default: return !!actualValue;
    }
  }

  // Resume a paused workflow (e.g. after approval)
  async resumeWorkflow(nodeId: string, action: 'approve' | 'reject') {
    const context = this.activeExecutionContext();
    if (!context || context.status !== 'active') return;

    // In a real engine, we'd load the full workflow object
    // For now, we assume it's the active one
    // We'll implement this bridge in the next step
    console.log(`Workflow resumed at ${nodeId} with action: ${action}`);
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
