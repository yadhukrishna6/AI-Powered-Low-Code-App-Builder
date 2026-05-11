// src/app/features/workflow/services/enhanced-graph-engine.service.ts

import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jsPlumb, jsPlumbInstance, Defaults, Connection, OverlaySpec } from 'jsplumb';
import { WorkflowNode, WorkflowEdge } from '../models/workflow.model';
import { RuntimeStateService } from './runtime-state.service';
import { RuntimeVisualizationConfig } from '../models/runtime.model';

@Injectable({
  providedIn: 'root'
})
export class EnhancedGraphEngineService {
  private instance?: jsPlumbInstance;
  private container?: HTMLElement;
  private connections = new Map<string, Connection>();

  private runtimeState = inject(RuntimeStateService);

  private readonly JS_PLUMB_DEFAULTS: Defaults = {
    Anchor: 'Continuous',
    Connector: ['Bezier', { curviness: 50 }],
    Endpoint: ['Dot', { radius: 6 }],
    PaintStyle: { stroke: '#94a3b8', strokeWidth: 2 },
    HoverPaintStyle: { stroke: '#3b82f6', strokeWidth: 3 },
    EndpointStyle: { fill: '#94a3b8' },
    EndpointHoverStyle: { fill: '#3b82f6' },
    ConnectionOverlays: [
      ['Arrow', {
        location: 1,
        width: 10,
        length: 10,
        foldback: 0.8,
        cssClass: 'connection-arrow'
      }]
    ],
    Container: undefined
  };

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  initialize(container: HTMLElement) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.container = container;
    this.instance = jsPlumb.getInstance({
      ...this.JS_PLUMB_DEFAULTS,
      Container: container
    });

    this.setupRuntimeStyling();
  }

  private setupRuntimeStyling() {
    if (!this.instance) return;

    // Bind to connection events for runtime styling
    this.instance.bind('connection', (info: any) => {
      const connection = info.connection;
      const edgeId = this.getEdgeIdFromConnection(connection);
      if (edgeId) {
        this.connections.set(edgeId, connection);
        this.updateConnectionStyling(edgeId);
      }
    });

    // Listen to runtime state changes
    this.runtimeState.executionEvents$.subscribe(event => {
      if (event) {
        this.handleExecutionEvent(event);
      }
    });
  }

  private getEdgeIdFromConnection(connection: Connection): string | null {
    // Extract edge ID from connection data or DOM attributes
    return connection.getParameter('edgeId') ||
           this.getEdgeIdFromElement(connection.source) ||
           null;
  }

  private getEdgeIdFromElement(element: Element): string | null {
    const nodeElement = element.closest('[data-node-id]');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-node-id');
      // This is a simplified approach - in a real implementation,
      // you'd need to map node connections to edge IDs
      return `edge-${nodeId}`;
    }
    return null;
  }

  private handleExecutionEvent(event: any) {
    switch (event.type) {
      case 'node_started':
        this.updateNodeVisualState(event.nodeId, 'running');
        break;
      case 'node_completed':
        const state = this.runtimeState.getNodeState(event.nodeId);
        if (state) {
          this.updateNodeVisualState(event.nodeId, state.state);
        }
        break;
      case 'edge_activated':
        this.updateConnectionStyling(event.edgeId);
        break;
    }
  }

  updateNodeVisualState(nodeId: string, state: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return;

    // Remove all previous state classes
    nodeElement.classList.remove(
      'node-idle', 'node-queued', 'node-running', 'node-success',
      'node-failed', 'node-skipped', 'node-waiting', 'node-cancelled'
    );

    // Add new state class
    nodeElement.classList.add(`node-${state}`);

    // Add animation class if enabled
    const config = this.runtimeState.config();
    if (config.animations.enabled) {
      nodeElement.classList.add('animated');

      // Remove animation class after animation completes
      setTimeout(() => {
        nodeElement.classList.remove('animated');
      }, config.animations.duration);
    }
  }

  updateConnectionStyling(edgeId: string) {
    const connection = this.connections.get(edgeId);
    if (!connection) return;

    const edgeState = this.runtimeState.getEdgeState(edgeId);
    if (!edgeState) return;

    const config = this.runtimeState.config();

    // Update connection styling using CSS classes and DOM manipulation
    this.updateConnectionCSSClasses(connection, edgeState.state);

    // Update overlays for branch indicators
    this.updateConnectionOverlays(connection, edgeState);
  }

  private updateConnectionCSSClasses(connection: Connection, state: string) {
    // Get the SVG path element for the connection
    const pathElement = this.getConnectionPathElement(connection);
    if (!pathElement) return;

    // Remove all previous state classes
    pathElement.classList.remove(
      'edge-inactive', 'edge-active', 'edge-success-path',
      'edge-failed-path', 'edge-skipped-path'
    );

    // Add new state class
    pathElement.classList.add(`edge-${state}`);

    // Add flow animation if enabled
    const config = this.runtimeState.config();
    if (config.styles.edgeAnimation && state === 'active') {
      pathElement.classList.add('flow-animation');
    } else {
      pathElement.classList.remove('flow-animation');
    }
  }

  private getConnectionPathElement(connection: Connection): SVGPathElement | null {
    // Find the SVG path element within the connection
    // jsPlumb creates connections with specific DOM structure
    // We'll use a different approach to find the path element
    const container = this.container;
    if (!container) return null;

    // Look for SVG elements that might be part of this connection
    // This is a simplified approach - in practice, you'd need to track
    // the relationship between connections and their DOM elements
    const svgElements = container.querySelectorAll('svg');
    for (const svg of svgElements) {
      const pathElement = svg.querySelector('path');
      if (pathElement) {
        // Check if this path belongs to our connection
        // This would require additional logic to match connections to paths
        return pathElement as SVGPathElement;
      }
    }

    return null;
  }

  private updateConnectionOverlays(connection: Connection, edgeState: any) {
    // Remove existing overlays except the arrow
    const overlays = connection.getOverlays();
    Object.keys(overlays).forEach(key => {
      if (key !== 'Arrow') {
        connection.removeOverlay(key);
      }
    });

    // Add branch label if applicable
    if (edgeState.branchType) {
      connection.addOverlay(['Label', {
        label: edgeState.branchType.toUpperCase(),
        location: 0.5,
        cssClass: `branch-label branch-${edgeState.branchType}`,
        id: 'branchLabel'
      }]);
    }

    // Add execution indicator
    if (edgeState.executionCount && edgeState.executionCount > 1) {
      connection.addOverlay(['Label', {
        label: `${edgeState.executionCount}x`,
        location: 0.3,
        cssClass: 'execution-count',
        id: 'executionCount'
      }]);
    }

    // Repaint to update overlays
    connection.repaint();
  }

  // Flow Animation Methods
  startFlowAnimation(edgeId: string) {
    const connection = this.connections.get(edgeId);
    if (!connection) return;

    const pathElement = this.getConnectionPathElement(connection);
    if (pathElement) {
      pathElement.classList.add('flow-active');
    }
  }

  stopFlowAnimation(edgeId: string) {
    const connection = this.connections.get(edgeId);
    if (!connection) return;

    const pathElement = this.getConnectionPathElement(connection);
    if (pathElement) {
      pathElement.classList.remove('flow-active');
    }
  }

  // Node Status Badge Management
  updateNodeStatusBadge(nodeId: string) {
    const nodeState = this.runtimeState.getNodeState(nodeId);
    if (!nodeState) return;

    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"] .node-status-badge`);
    if (!nodeElement) return;

    // Update badge content and styling
    nodeElement.className = `node-status-badge status-${nodeState.state}`;
    nodeElement.innerHTML = this.getStatusBadgeIcon(nodeState.state);
  }

  private getStatusBadgeIcon(state: string): string {
    const icons: Record<string, string> = {
      'running': '⟳',
      'success': '✓',
      'failed': '✗',
      'idle': '○',
      'queued': '⋯',
      'waiting': '⏸',
      'skipped': '⊘',
      'cancelled': '⊗'
    };
    return icons[state] || '○';
  }

  // Cleanup method
  destroy() {
    if (this.instance) {
      this.instance.reset();
      this.instance = undefined;
    }
    this.connections.clear();
  }
}