import { Injectable, signal, computed, inject } from '@angular/core';
import { Workflow, WorkflowNode, WorkflowEdge, Position } from '../models/workflow.model';
import { NODE_REGISTRY } from '../registry/node-registry';
import { ProjectService } from '../../../core/services/project.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class WorkflowStateService {
  private projectService = inject(ProjectService);
  // State Signals
  private _workflow = signal<Workflow>({
    id: uuidv4(),
    name: 'Untitled Workflow',
    nodes: [],
    edges: [],
    metadata: {
      version: '1.0.0',
      lastSaved: new Date()
    }
  });

  private _selectedNodeId = signal<string | null>(null);
  private _selectedEdgeId = signal<string | null>(null);
  private _isDragging = signal<boolean>(false);
  private _zoomLevel = signal<number>(1);
  private _panPosition = signal<Position>({ x: 0, y: 0 });

  // Selectors
  workflow = computed(() => this._workflow());
  nodes = computed(() => this._workflow().nodes);
  edges = computed(() => this._workflow().edges);
  selectedNode = computed(() => 
    this._workflow().nodes.find(n => n.id === this._selectedNodeId()) || null
  );
  zoomLevel = computed(() => this._zoomLevel());
  panPosition = computed(() => this._panPosition());

  private syncWithProject() {
    const activeProject = this.projectService.activeProject();
    if (activeProject) {
      this.projectService.updateProjectWorkflows(activeProject.id, [this._workflow()]);
    }
  }

  // Actions
  addNode(subType: string, position: Position) {
    const registryEntry = NODE_REGISTRY[subType];
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
      nodes: [...w.nodes, newNode]
    }));

    this.selectNode(newNode.id);
    this.syncWithProject();
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

  removeNode(nodeId: string) {
    this._workflow.update(w => ({
      ...w,
      nodes: w.nodes.filter(n => n.id !== nodeId),
      edges: w.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    }));
    if (this._selectedNodeId() === nodeId) this._selectedNodeId.set(null);
    this.syncWithProject();
  }

  addEdge(sourceId: string, targetId: string) {
    const exists = this._workflow().edges.some(
      e => e.source === sourceId && e.target === targetId
    );
    if (exists || sourceId === targetId) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${uuidv4().substring(0, 8)}`,
      source: sourceId,
      target: targetId
    };

    this._workflow.update(w => ({
      ...w,
      edges: [...w.edges, newEdge]
    }));
    this.syncWithProject();
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

  setZoom(level: number) {
    this._zoomLevel.set(Math.max(0.1, Math.min(2, level)));
  }

  setPan(position: Position) {
    this._panPosition.set(position);
  }

  // State Persistence
  loadWorkflow(workflow: Workflow) {
    this._workflow.set(JSON.parse(JSON.stringify(workflow)));
  }

  loadProjectWorkflows(workflows: Workflow[]) {
    if (workflows && workflows.length > 0) {
      this.loadWorkflow(workflows[0]);
    } else {
      // Reset to empty if no workflows
      this._workflow.set({
        id: uuidv4(),
        name: 'Untitled Workflow',
        nodes: [],
        edges: [],
        metadata: { version: '1.0.0', lastSaved: new Date() }
      });
    }
  }

  exportWorkflow(): Workflow {
    return this._workflow();
  }
}
