import { Injectable } from '@angular/core';
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowExecutionContext, NodeExecutionResult } from '../models/workflow.model';
import { Observable, from, of, delay, concatMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WorkflowRuntimeService {
  
  /**
   * Executes a workflow from the start node.
   * In a production environment, this logic would likely live on the backend.
   * Here we implement a simulator for the frontend.
   */
  async executeWorkflow(workflow: Workflow): Promise<WorkflowExecutionContext> {
    const startNode = workflow.nodes.find(n => n.subType === 'start');
    if (!startNode) {
      throw new Error('Workflow must have a Start Trigger node.');
    }

    const context: WorkflowExecutionContext = {
      workflowId: workflow.id,
      variables: {},
      executionPath: [],
      status: 'active'
    };

    console.log(`🚀 Starting Workflow: ${workflow.name}`);
    await this.executeNode(startNode.id, workflow, context);
    
    context.status = 'completed';
    console.log('✅ Workflow Execution Completed', context);
    return context;
  }

  private async executeNode(nodeId: string, workflow: Workflow, context: WorkflowExecutionContext) {
    const node = workflow.nodes.find(n => n.id === nodeId);
    if (!node) return;

    context.currentNodeId = nodeId;
    context.executionPath.push(nodeId);
    
    // 1. Mark node as running
    node.status = 'running';
    console.log(`⏳ Executing Node: ${node.label} (${node.subType})`);

    // 2. Perform logic based on type (Simulation)
    const result = await this.simulateNodeExecution(node, context);

    // 3. Mark node as success/error
    node.status = result.success ? 'success' : 'error';
    if (!result.success) {
      node.errorMessage = result.error;
      context.status = 'failed';
      return;
    }

    // 4. Find next nodes to execute
    const outgoingEdges = workflow.edges.filter(e => e.source === nodeId);
    
    // For logic nodes like 'condition', we might follow specific edges
    let nextNodeIds: string[] = [];
    
    if (node.subType === 'condition') {
      // Logic for branching based on simulateNodeExecution result
      const branchLabel = result.output?.branch || 'true';
      const edge = outgoingEdges.find(e => e.label === branchLabel) || outgoingEdges[0];
      if (edge) nextNodeIds.push(edge.target);
    } else {
      // Standard linear flow
      nextNodeIds = outgoingEdges.map(e => e.target);
    }

    // 5. Recursively execute next nodes
    for (const nextId of nextNodeIds) {
      await this.executeNode(nextId, workflow, context);
    }
  }

  private async simulateNodeExecution(node: WorkflowNode, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    // Artificial delay for visual effect in MVP
    await new Promise(resolve => setTimeout(resolve, 800));

    switch (node.subType) {
      case 'api-request':
        console.log(`   🌐 API Call to: ${node.data.url}`);
        // In a real app, this would use HttpClient
        return { nodeId: node.id, success: true, output: { status: 200, data: 'OK' } };

      case 'condition':
        const result = Math.random() > 0.5; // Simulate a condition check
        console.log(`   ⚖️ Condition check: ${result}`);
        return { nodeId: node.id, success: true, output: { branch: result ? 'true' : 'false' } };

      case 'approval':
        console.log(`   👤 Waiting for Approval from: ${node.data.approverRole}`);
        // Simulate a delay or manual intervention
        return { nodeId: node.id, success: true };

      case 'send-notification':
        console.log(`   📧 Sending ${node.data.channel} Notification`);
        return { nodeId: node.id, success: true };

      default:
        return { nodeId: node.id, success: true };
    }
  }
}
