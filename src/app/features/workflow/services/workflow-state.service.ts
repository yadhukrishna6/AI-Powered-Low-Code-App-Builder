import { Injectable, signal, computed, inject } from '@angular/core';
import { Workflow, WorkflowNode, WorkflowEdge, Position, ExecutionStatus } from '../models/workflow.model';
import { NodeRegistryService } from '../registry/node-registry.service';
import { ProjectService } from '../../../core/services/project.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateService {
  private projectService = inject(ProjectService);
  private nodeRegistry = inject(NodeRegistryService);

  // State Signals
  private _workflow = signal<Workflow>({
    id: uuidv4(),
    name: 'Untitled Workflow',
    nodes: [],
    edges: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    metadata: {
      version: '1.0.0',
      lastSaved: new Date().toISOString()
    }
  });

  private _selectedNodeId = signal<string | null>(null);
  private _selectedEdgeId = signal<string | null>(null);

  // Selectors
  workflow = computed(() => this._workflow());
  nodes = computed(() => this._workflow().nodes);
  edges = computed(() => this._workflow().edges);
  selectedNode = computed(() => 
    this._workflow().nodes.find(n => n.id === this._selectedNodeId()) || null
  );
  zoomLevel = computed(() => this._workflow().zoom);
  panPosition = computed(() => this._workflow().pan);

  private syncWithProject() {
    const activeProject = this.projectService.activeProject();
    if (activeProject) {
      this.projectService.updateProjectWorkflows(activeProject.id, [this._workflow()]);
    }
  }

  // Actions
  addNode(subType: string, position: Position) {
    const registryEntry = this.nodeRegistry.getEntry(subType);
    if (!registryEntry) return;

    const newNode: WorkflowNode = {
      id: `node_${uuidv4().substring(0, 8)}`,
      type: registryEntry.type,
      subType: registryEntry.subType,
      label: registryEntry.label,
      position,
      data: { ...registryEntry.defaultData },
      status: 'idle'
    };

    this._workflow.update(w => ({
      ...w,
      nodes: [...w.nodes, newNode],
      metadata: { ...w.metadata, lastSaved: new Date().toISOString() }
    }));

    this.selectNode(newNode.id);
    this.syncWithProject();
    return newNode;
  }

  updateNodePosition(nodeId: string, position: Position) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, position } : n)
    }));
    this.syncWithProject();
  }

  updateNodeData(nodeId: string, data: any) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    }));
    this.syncWithProject();
  }

  updateNodeStatus(nodeId: string, status: ExecutionStatus, errorMessage?: string) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, status, errorMessage } : n)
    }));
  }

  removeNode(nodeId: string) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.filter(n => n.id !== nodeId),
      edges: w.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
    if (this._selectedNodeId() === nodeId) this._selectedNodeId.set(null);
    this.syncWithProject();
  }

  addEdge(sourceId: string, targetId: string, sourceAnchor?: string, targetAnchor?: string) {
    const exists = this._workflow().edges.some(
      e => e.source === sourceId && e.target === targetId && e.sourceAnchor === sourceAnchor
    );
    if (exists || sourceId === targetId) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${uuidv4().substring(0, 8)}`,
      source: sourceId,
      target: targetId,
      sourceAnchor,
      targetAnchor,
      type: 'default'
    };

    this._workflow.update(w => ({
      ...w,
      edges: [...w.edges, newEdge]
    }));
    this.syncWithProject();
    return newEdge;
  }

  removeEdge(edgeId: string) {
    this._workflow.update(w => ({
      ...w,
      edges: w.edges.filter(e => e.id !== edgeId)
    }));
    this.syncWithProject();
  }

  selectNode(nodeId: string | null) {
    this._selectedNodeId.set(nodeId);
    this._selectedEdgeId.set(null);
  }

  setZoom(zoom: number) {
    this._workflow.update(w => ({
      ...w,
      zoom: Math.max(0.1, Math.min(2, zoom))
    }));
  }

  setPan(pan: Position) {
    this._workflow.update(w => ({ ...w, pan }));
  }

  // State Persistence
  loadWorkflow(workflow: Workflow) {
    // Basic migration/defaulting for older schemas
    const updatedWorkflow = {
      ...workflow,
      zoom: workflow.zoom || 1,
      pan: workflow.pan || { x: 0, y: 0 },
      metadata: {
        ...workflow.metadata,
        lastSaved: workflow.metadata.lastSaved || new Date().toISOString()
      }
    };
    this._workflow.set(updatedWorkflow);
  }

  loadProjectWorkflows(workflows: Workflow[]) {
    if (workflows && workflows.length > 0) {
      this.loadWorkflow(workflows[0]);
    } else {
      this._workflow.set({
        id: uuidv4(),
        name: 'Untitled Workflow',
        nodes: [],
        edges: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        metadata: { version: '1.0.0', lastSaved: new Date().toISOString() }
      });
    }
  }
}
