import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Workflow, WorkflowNode, WorkflowEdge, Position, ExecutionStatus } from '../models/workflow.model';
import { NodeRegistryService } from '../registry/node-registry.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateService {
  private http = inject(HttpClient);
  private nodeRegistry = inject(NodeRegistryService);
  private apiUrl = 'http://localhost:3000/api/v1/workflows';

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

  // Persistence Actions
  async saveWorkflow() {
    try {
      const current = this._workflow();
      const payload = {
        id: current.id,
        name: current.name,
        graph: current // Saving the whole graph as JSON
      };
      await firstValueFrom(this.http.post(this.apiUrl, payload));
      console.log('Workflow saved to DB');
    } catch (e) {
      console.error('Failed to save workflow:', e);
    }
  }

  async loadWorkflowFromApi(id: string) {
    try {
      const data = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      if (data && data.graph) {
        this.loadWorkflow(data.graph);
      }
    } catch (e) {
      console.error('Failed to load workflow:', e);
    }
  }

  async listWorkflows() {
    try {
      return await firstValueFrom(this.http.get<any[]>(this.apiUrl));
    } catch (e) {
      console.error('Failed to list workflows:', e);
      return [];
    }
  }

  // UI Actions
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
    return newNode;
  }

  updateNodePosition(nodeId: string, position: Position) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, position } : n)
    }));
  }

  updateNodeData(nodeId: string, data: any) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    }));
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
    return newEdge;
  }

  removeEdge(edgeId: string) {
    this._workflow.update(w => ({
      ...w,
      edges: w.edges.filter(e => e.id !== edgeId)
    }));
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

  loadWorkflow(workflow: Workflow) {
    this._workflow.set({
      ...workflow,
      zoom: workflow.zoom || 1,
      pan: workflow.pan || { x: 0, y: 0 }
    });
  }

  exportWorkflow(): Workflow {
    return this._workflow();
  }
}
