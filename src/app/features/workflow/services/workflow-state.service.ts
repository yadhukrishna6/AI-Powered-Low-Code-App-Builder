import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Workflow, WorkflowNode, WorkflowEdge, Position, ExecutionStatus, EdgeExecutionState } from '../models/workflow.model';
import { NodeRegistryService } from '../registry/node-registry.service';
import { ModalService } from '../../../core/services/modal.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateService {
  private http = inject(HttpClient);
  private nodeRegistry = inject(NodeRegistryService);
  private apiUrl = 'http://localhost:3000/api/v1/workflows';

  // Tracks the actual DB record ID (null means never saved)
  private _dbId: string | null = null;

  // State Signals
  private _workflow = signal<Workflow & { projectId?: string }>({
    id: uuidv4(),
    name: 'Untitled Workflow',
    nodes: [],
    edges: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    projectId: '',
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
  
  availableVariables = computed(() => {
    const vars: any[] = [];
    this._workflow().nodes.forEach(node => {
      // Node-based outputs
      if (node.subType === 'api-request') {
        vars.push({ label: `${node.label} Response`, value: `${node.id}.response` });
      } else if (node.subType === 'transform') {
        vars.push({ label: `${node.label} Result`, value: `${node.id}.result` });
      } else {
        vars.push({ label: `${node.label} Output`, value: node.id });
      }
    });
    return vars;
  });

  // Persistence Actions
  async createWorkflow(projectId: string, name: string = 'Main Workflow') {
    try {
      const payload = {
        name,
        projectId,
        graph: this._workflow()
      };
      const created = await firstValueFrom(this.http.post<any>(this.apiUrl, payload));
      // Always use the DB record ID as the canonical workflow ID
      this._dbId = created.id;
      const graph = created.graph || this._workflow();
      graph.id = created.id;
      this.loadWorkflow(graph, projectId);
      return created.id;
    } catch (e) {
      console.error('Failed to create workflow:', e);
      return null;
    }
  }

  async saveWorkflow() {
    try {
      const current = this._workflow();

      // If we've never saved this workflow, create it
      if (!this._dbId) {
        return this.createWorkflow(current.projectId || '', current.name);
      }

      // Update existing workflow (Draft)
      const payload = {
        name: current.name,
        graph: { ...current, id: this._dbId }
      };

      const response = await firstValueFrom(this.http.put<any>(`${this.apiUrl}/${this._dbId}`, payload));
      if (response && response.draftGraph) {
        this.loadWorkflow(response.draftGraph, response.projectId);
      }
      console.log('Workflow draft saved');
    } catch (e: any) {
      if (e.status === 404) {
        this._dbId = null;
        return this.createWorkflow(this._workflow().projectId || '', this._workflow().name);
      }
      console.error('Failed to save workflow:', e);
    }
  }

  async publishWorkflow(metadata: any = {}) {
    if (!this._dbId) return null;
    try {
      const response = await firstValueFrom(this.http.post<any>(`${this.apiUrl}/${this._dbId}/publish`, metadata));
      console.log('Workflow published as version', response.version);
      return response;
    } catch (e) {
      console.error('Failed to publish workflow:', e);
      return null;
    }
  }

  async loadWorkflowFromApi(id: string) {
    try {
      const data = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      if (data) {
        this._dbId = data.id;
        // Prefer draftGraph for editing, fallback to versioned graph if needed
        const graph = data.draftGraph || (data.versions?.[0]?.graph) || { nodes: [], edges: [] };
        graph.id = data.id;
        this.loadWorkflow(graph, data.projectId);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to load workflow:', e);
      return false;
    }
  }

  async loadExecutionHistory(executionId: string) {
    try {
      const data = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/executions/${executionId}`));
      if (data && data.version?.graph) {
        this.loadWorkflow(data.version.graph);
        // Map logs to node statuses
        data.logs.forEach((log: any) => {
          this.updateNodeStatus(log.nodeId, log.status as ExecutionStatus, log.error);
          
          // Highlight paths
          const edges = this._workflow().edges.filter(e => e.source === log.nodeId);
          // In a real replay we would check which edge was actually taken from log metadata
        });
      }
      return data;
    } catch (e) {
      console.error('Failed to load execution history:', e);
      return null;
    }
  }

  async loadWorkflowByProject(projectId: string) {
    try {
      const workflows = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}?projectId=${projectId}`));
      if (workflows && workflows.length > 0) {
        const first = workflows[0];
        // Always override graph.id with the canonical DB record ID
        this._dbId = first.id;
        const graph = first.graph || { nodes: [], edges: [] };
        graph.id = first.id;
        this.loadWorkflow(graph, projectId);
        return first.id;
      }
      return null;
    } catch (e) {
      console.error('Failed to load workflow by project:', e);
      return null;
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

  private modal = inject(ModalService);

  async promptBranchSelection(branches: { id: string, label: string, color?: string }[]): Promise<string | null> {
    return await this.modal.show({
      title: 'Select Path',
      message: 'Choose which branch to connect for this automation path:',
      type: 'select',
      confirmText: 'Connect',
      options: branches.map(b => ({ label: b.label, value: b.id, color: b.color }))
    }) as string | null;
  }

  addEdge(sourceId: string, targetId: string, sourceAnchor?: string, targetAnchor?: string) {
    const exists = this._workflow().edges.some(
      e => e.source === sourceId && e.target === targetId && e.sourceAnchor === sourceAnchor
    );
    if (exists || sourceId === targetId) return;

    // Resolve branch label and color for the edge
    const sourceNode = this._workflow().nodes.find(n => n.id === sourceId);
    let label = '';
    let color = '';
    if (sourceNode && sourceAnchor) {
      const entry = this.nodeRegistry.getEntry(sourceNode.subType);
      const branch = entry.branches?.find(b => b.id === sourceAnchor);
      label = branch?.label || '';
      color = branch?.color || '';
    }

    const newEdge: WorkflowEdge = {
      id: `edge_${uuidv4().substring(0, 8)}`,
      source: sourceId,
      target: targetId,
      sourceAnchor,
      targetAnchor,
      label,
      color,
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

  updateEdgeExecutionState(edgeId: string, executionState: EdgeExecutionState) {
    this._workflow.update(w => ({
      ...w,
      edges: w.edges.map(e => e.id === edgeId ? { ...e, executionState } : e)
    }));
  }

  resetExecutionStates() {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.map(n => ({ ...n, status: 'idle' as ExecutionStatus, errorMessage: undefined, executionDuration: undefined })),
      edges: w.edges.map(e => ({ ...e, executionState: 'inactive' as EdgeExecutionState }))
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

  loadWorkflow(workflow: Workflow, projectId?: string) {
    this._workflow.set({
      ...workflow,
      projectId: projectId || (workflow as any).projectId,
      zoom: workflow.zoom || 1,
      pan: workflow.pan || { x: 0, y: 0 }
    });
    
    // Auto-reset execution visuals on load
    this.resetExecutionStates();
  }

  exportWorkflow(): Workflow {
    return this._workflow();
  }

  /** Returns the canonical DB record ID, or null if never persisted */
  getDbId(): string | null {
    return this._dbId;
  }
}
