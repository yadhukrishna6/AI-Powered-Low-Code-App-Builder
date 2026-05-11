import { Injectable, inject } from '@angular/core';
import { WorkflowNode, WorkflowEdge, WorkflowNodeType } from '../models/workflow.model';
import { WorkflowStateService } from './workflow-state.service';
import { NODE_REGISTRY } from '../registry/node-registry';

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export interface NodeConstraints {
  maxInputs: number;
  maxOutputs: number;
  allowedOutputHandles?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GraphValidationService {
  private state = inject(WorkflowStateService);

  // Define constraints based on Node Types/SubTypes
  private readonly TYPE_CONSTRAINTS: Record<string, NodeConstraints> = {
    'trigger': { maxInputs: 0, maxOutputs: 1 },
    'action': { maxInputs: -1, maxOutputs: 1 }, // -1 for unlimited merging
    'logic': { maxInputs: -1, maxOutputs: -1 }, 
    'condition': { maxInputs: -1, maxOutputs: 2, allowedOutputHandles: ['true', 'false'] },
    'end': { maxInputs: -1, maxOutputs: 0 }
  };

  /**
   * Core validation logic for establishing a connection
   */
  canConnect(sourceId: string, targetId: string, sourceHandle?: string): ValidationResult {
    const nodes = this.state.nodes();
    const edges = this.state.edges();
    
    const sourceNode = nodes.find(n => n.id === sourceId);
    const targetNode = nodes.find(n => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return { isValid: false, reason: 'Invalid nodes' };
    }

    // 1. Prevent Self-Connections
    if (sourceId === targetId) {
      return { isValid: false, reason: 'A node cannot connect to itself' };
    }

    // 2. Prevent Duplicate Edges (Same Source, Same Target, Same Handle)
    const duplicate = edges.find(e => 
      e.source === sourceId && 
      e.target === targetId && 
      e.sourceAnchor === sourceHandle
    );
    if (duplicate) {
      return { isValid: false, reason: `Branch "${sourceHandle}" is already connected to this target.` };
    }

    // 3. Source Constraints (Output Limits)
    const sourceConstraints = this.getConstraints(sourceNode);
    const sourceOutputCount = edges.filter(e => e.source === sourceId).length;
    
    if (sourceConstraints.maxOutputs !== -1 && sourceOutputCount >= sourceConstraints.maxOutputs) {
      return { isValid: false, reason: `${sourceNode.label} has reached its maximum output limit` };
    }

    // 4. Handle Uniqueness (Prevent multiple edges from the same specific handle)
    if (sourceHandle) {
      const handleOccupied = edges.find(e => e.source === sourceId && e.sourceAnchor === sourceHandle);
      if (handleOccupied) {
        return { isValid: false, reason: `The branch "${sourceHandle}" is already in use.` };
      }
    }

    // 5. Target Constraints (Input Limits)
    const targetConstraints = this.getConstraints(targetNode);
    const targetInputCount = edges.filter(e => e.target === targetId).length;

    if (targetConstraints.maxInputs !== -1 && targetInputCount >= targetConstraints.maxInputs) {
      return { isValid: false, reason: `${targetNode.label} already has an input connection` };
    }

    // 6. Semantic Validation (e.g. Triggers cannot be targets)
    if (targetNode.type === 'trigger') {
      return { isValid: false, reason: 'Triggers cannot receive input connections' };
    }

    return { isValid: true };
  }

  private getConstraints(node: WorkflowNode): NodeConstraints {
    // Check subtype specifically first (e.g. condition vs generic logic)
    if (this.TYPE_CONSTRAINTS[node.subType]) {
      return this.TYPE_CONSTRAINTS[node.subType];
    }
    // Fallback to type-level constraints
    return this.TYPE_CONSTRAINTS[node.type] || { maxInputs: 1, maxOutputs: 1 };
  }

  /**
   * Detects if adding an edge would create a cycle (Future-proofing)
   */
  wouldCreateCycle(sourceId: string, targetId: string): boolean {
    const edges = this.state.edges();
    const visited = new Set<string>();
    const stack = [targetId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === sourceId) return true;
      if (visited.has(current)) continue;
      
      visited.add(current);
      const neighbors = edges.filter(e => e.source === current).map(e => e.target);
      stack.push(...neighbors);
    }

    return false;
  }
}
