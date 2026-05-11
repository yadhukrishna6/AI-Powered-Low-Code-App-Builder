// src/app/features/workflow/services/runtime-state.service.ts

import { Injectable, signal, computed, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  NodeExecutionState,
  EdgeExecutionState,
  NodeExecutionMetadata,
  EdgeExecutionMetadata,
  WorkflowExecutionSnapshot,
  ExecutionEvent,
  RuntimeVisualizationConfig
} from '../models/runtime.model';
import { WorkflowStateService } from './workflow-state.service';

@Injectable({
  providedIn: 'root'
})
export class RuntimeStateService {
  private workflowState = inject(WorkflowStateService);

  // Runtime State Signals
  private _executionSnapshot = signal<WorkflowExecutionSnapshot | null>(null);
  private _nodeStates = signal<Map<string, NodeExecutionMetadata>>(new Map());
  private _edgeStates = signal<Map<string, EdgeExecutionMetadata>>(new Map());
  private _isExecuting = signal<boolean>(false);
  private _currentNodeId = signal<string | null>(null);

  // Event Stream
  private _executionEvents = new BehaviorSubject<ExecutionEvent | null>(null);

  // Configuration
  private _config = signal<RuntimeVisualizationConfig>({
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    },
    colors: {
      node: {
        idle: '#64748b',
        queued: '#f59e0b',
        running: '#3b82f6',
        success: '#10b981',
        failed: '#ef4444',
        skipped: '#9ca3af',
        waiting: '#f59e0b',
        cancelled: '#6b7280'
      },
      edge: {
        inactive: '#94a3b8',
        active: '#3b82f6',
        successPath: '#10b981',
        failedPath: '#ef4444',
        skippedPath: '#d1d5db'
      }
    },
    styles: {
      nodeGlow: true,
      edgeAnimation: true,
      pulseEffects: true,
      statusBadges: true
    }
  });

  // Computed Selectors
  executionSnapshot = computed(() => this._executionSnapshot());
  nodeStates = computed(() => this._nodeStates());
  edgeStates = computed(() => this._edgeStates());
  isExecuting = computed(() => this._isExecuting());
  currentNodeId = computed(() => this._currentNodeId());
  config = computed(() => this._config());

  // Event Observables
  executionEvents$ = this._executionEvents.asObservable();

  // Node State Management
  getNodeState(nodeId: string): NodeExecutionMetadata | null {
    return this._nodeStates().get(nodeId) || null;
  }

  setNodeState(nodeId: string, state: NodeExecutionState, metadata?: Partial<NodeExecutionMetadata>) {
    const currentState = this._nodeStates().get(nodeId);
    const newMetadata: NodeExecutionMetadata = {
      nodeId,
      state,
      startedAt: state === 'running' ? new Date() : currentState?.startedAt,
      completedAt: ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? new Date() : undefined,
      ...currentState,
      ...metadata
    };

    // Calculate duration if completed
    if (newMetadata.completedAt && newMetadata.startedAt) {
      newMetadata.duration = newMetadata.completedAt.getTime() - newMetadata.startedAt.getTime();
    }

    this._nodeStates.update(states => {
      const newStates = new Map(states);
      newStates.set(nodeId, newMetadata);
      return newStates;
    });

    // Update workflow state service
    this.workflowState.updateNodeStatus(nodeId, state as any, newMetadata.error);

    // Emit event
    this._executionEvents.next({
      type: state === 'running' ? 'node_started' :
            ['success', 'failed', 'skipped', 'cancelled'].includes(state) ? 'node_completed' : 'node_failed',
      timestamp: new Date(),
      nodeId,
      data: newMetadata
    });

    // Update current node
    if (state === 'running') {
      this._currentNodeId.set(nodeId);
    } else if (this._currentNodeId() === nodeId) {
      this._currentNodeId.set(null);
    }
  }

  // Edge State Management
  getEdgeState(edgeId: string): EdgeExecutionMetadata | null {
    return this._edgeStates().get(edgeId) || null;
  }

  setEdgeState(edgeId: string, state: EdgeExecutionState, metadata?: Partial<EdgeExecutionMetadata>) {
    const currentState = this._edgeStates().get(edgeId);
    const newMetadata: EdgeExecutionMetadata = {
      edgeId,
      state,
      executedAt: state !== 'inactive' ? new Date() : currentState?.executedAt,
      executionCount: (currentState?.executionCount || 0) + (state !== 'inactive' ? 1 : 0),
      ...currentState,
      ...metadata
    };

    this._edgeStates.update(states => {
      const newStates = new Map(states);
      newStates.set(edgeId, newMetadata);
      return newStates;
    });

    // Emit event
    if (state === 'active') {
      this._executionEvents.next({
        type: 'edge_activated',
        timestamp: new Date(),
        edgeId,
        data: newMetadata
      });
    }
  }

  // Execution Lifecycle
  startExecution(executionId: string, workflowId: string) {
    this._isExecuting.set(true);
    this._executionSnapshot.set({
      executionId,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      nodeStates: [],
      edgeStates: [],
      variables: {},
      progress: 0
    });

    this._executionEvents.next({
      type: 'execution_completed',
      timestamp: new Date(),
      data: { status: 'started', executionId }
    });
  }

  completeExecution(status: 'completed' | 'failed' | 'cancelled') {
    this._isExecuting.set(false);
    this._currentNodeId.set(null);

    this._executionSnapshot.update(snapshot => {
      if (!snapshot) return null;
      return {
        ...snapshot,
        status,
        completedAt: new Date(),
        progress: 100
      };
    });

    this._executionEvents.next({
      type: 'execution_completed',
      timestamp: new Date(),
      data: { status, executionId: this._executionSnapshot()?.executionId }
    });
  }

  // State Persistence
  saveExecutionState(): WorkflowExecutionSnapshot | null {
    const snapshot = this._executionSnapshot();
    if (!snapshot) return null;

    // Convert Maps to arrays for JSON serialization
    const nodeStates = Array.from(this._nodeStates().values());
    const edgeStates = Array.from(this._edgeStates().values());

    return {
      ...snapshot,
      nodeStates,
      edgeStates
    };
  }

  loadExecutionState(snapshot: WorkflowExecutionSnapshot) {
    this._executionSnapshot.set(snapshot);
    this._isExecuting.set(snapshot.status === 'running');

    // Convert arrays back to Maps
    const nodeStates = new Map(snapshot.nodeStates.map(state => [state.nodeId, state]));
    const edgeStates = new Map(snapshot.edgeStates.map(state => [state.edgeId, state]));

    this._nodeStates.set(nodeStates);
    this._edgeStates.set(edgeStates);

    // Update workflow state service
    nodeStates.forEach((state, nodeId) => {
      this.workflowState.updateNodeStatus(nodeId, state.state as any, state.error);
    });
  }

  // Utility Methods
  resetExecutionState() {
    this._executionSnapshot.set(null);
    this._nodeStates.set(new Map());
    this._edgeStates.set(new Map());
    this._isExecuting.set(false);
    this._currentNodeId.set(null);
  }

  getExecutionProgress(): number {
    const snapshot = this._executionSnapshot();
    if (!snapshot) return 0;

    const totalNodes = this.workflowState.nodes().length;
    const completedNodes = Array.from(this._nodeStates().values())
      .filter(state => ['success', 'failed', 'skipped'].includes(state.state)).length;

    return totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0;
  }

  // Configuration
  updateConfig(config: Partial<RuntimeVisualizationConfig>) {
    this._config.update(current => ({ ...current, ...config }));
  }

  // Animation Helpers
  getNodeAnimationClass(nodeId: string): string {
    const state = this.getNodeState(nodeId)?.state;
    if (!state) return '';

    const config = this._config();
    if (!config.animations.enabled) return `node-${state}`;

    return `node-${state} ${config.styles.pulseEffects ? 'animated' : ''}`;
  }

  getEdgeAnimationClass(edgeId: string): string {
    const state = this.getEdgeState(edgeId)?.state;
    if (!state) return '';

    const config = this._config();
    if (!config.animations.enabled) return `edge-${state}`;

    return `edge-${state} ${config.styles.edgeAnimation ? 'flow-animation' : ''}`;
  }
}