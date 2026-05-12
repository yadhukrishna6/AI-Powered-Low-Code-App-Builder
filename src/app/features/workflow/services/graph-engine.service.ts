import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jsPlumb, jsPlumbInstance, Defaults } from 'jsplumb';
import { WorkflowNode, WorkflowEdge, Position } from '../models/workflow.model';
import { GraphValidationService } from './graph-validation.service';
import { ModalService } from '../../../core/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class GraphEngineService {
  private instance?: jsPlumbInstance;
  private container?: HTMLElement;

  private readonly JS_PLUMB_DEFAULTS: Defaults = {
    Anchor: 'Continuous',
    Connector: ['Bezier', { curviness: 50 }],
    Endpoint: ['Dot', { radius: 5 }],
    PaintStyle: { stroke: '#94a3b8', strokeWidth: 2 },
    HoverPaintStyle: { stroke: '#3b82f6', strokeWidth: 3 },
    EndpointStyle: { fill: '#94a3b8' },
    EndpointHoverStyle: { fill: '#3b82f6' },
    ConnectionOverlays: [
      ['Arrow', { location: 1, width: 10, length: 10, foldback: 0.8 }]
    ],
    Container: undefined
  };

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private validation = inject(GraphValidationService);
  private modal = inject(ModalService);

  initialize(container: HTMLElement) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.container = container;
    this.instance = jsPlumb.getInstance({
      ...this.JS_PLUMB_DEFAULTS,
      Container: container
    });

    // 1. Validation Logic: Before connection is dropped
    this.instance.bind('beforeDrop', (info: any) => {
      if (!info || !info.sourceId || !info.targetId) return false;
      
      // Basic connectivity check (raw nodes and limits)
      const result = this.validation.canConnect(info.sourceId, info.targetId);

      if (!result.isValid) {
        console.warn('Connection rejected:', result.reason);
        return false;
      }
      return true;
    });

    // 2. Global Events
    this.instance.bind('connection', (info: any) => {
      try {
        if (!info || !info.connection || info.connection.getParameter('programmatic')) return;

        const sourceEndpoint = info.sourceEndpoint;
        if (!sourceEndpoint || !sourceEndpoint.element) return;

        const sourceAnchor = sourceEndpoint.element.getAttribute('data-anchor');
        
        this.connectionCallback?.({
          connection: info.connection,
          sourceId: info.sourceId,
          targetId: info.targetId,
          sourceAnchor: sourceAnchor || undefined
        });
      } catch (e) {
        console.error('jsPlumb connection event error:', e);
      }
    });
  }

  private connectionCallback?: (info: any) => void;
  private dragStopCallback?: (info: { nodeId: string, position: Position }) => void;

  onConnection(callback: (info: any) => void) {
    this.connectionCallback = callback;
  }

  onDragStop(callback: (info: { nodeId: string, position: Position }) => void) {
    this.dragStopCallback = callback;
  }

  addNode(nodeId: string) {
    if (!this.instance) return;

    const el = document.getElementById(nodeId);
    if (!el) return;

    this.instance.draggable(el, {
      containment: 'parent',
      grid: [20, 20], // Snapping to 20px grid
      stop: (params: any) => {
        this.dragStopCallback?.({
          nodeId,
          position: { x: params.pos[0], y: params.pos[1] }
        });
      }
    } as any);

    // Make it a source (output) and target (input)
    this.instance.makeSource(el, {
      filter: '.handle-out',
      anchor: 'Continuous',
      connectorStyle: { stroke: '#94a3b8', strokeWidth: 2 },
      maxConnections: -1
    });

    this.instance.makeTarget(el, {
      filter: '.handle-in',
      anchor: 'Continuous',
      allowLoopback: false,
      maxConnections: -1
    });
  }

  removeNode(nodeId: string) {
    if (!this.instance) return;
    const el = document.getElementById(nodeId);
    if (el) {
      this.instance.remove(el);
    }
  }

  detachConnection(connection: any) {
    if (this.instance && connection) {
      this.instance.deleteConnection(connection);
    }
  }

  removeEdge(edgeId: string) {
    if (!this.instance) return;
    const connections = this.instance.getAllConnections() as any[];
    const conn = connections.find(c => c.getParameter('id') === edgeId);
    if (conn) {
      this.instance.deleteConnection(conn);
    }
  }

  destroy() {
    if (this.instance) {
      this.instance.reset();
      this.instance = undefined;
    }
  }

  connectNodes(sourceId: string, targetId: string, data?: any) {
    return this.connect(sourceId, targetId, data);
  }

  connect(sourceId: string, targetId: string, data?: any) {
    if (!this.instance) return;

    // Safety check: ensure elements exist in DOM before connecting
    const sourceEl = document.getElementById(sourceId);
    const targetEl = document.getElementById(targetId);

    if (!sourceEl || !targetEl) {
      console.warn(`Cannot connect: Source (${sourceId}: ${!!sourceEl}) or Target (${targetId}: ${!!targetEl}) not found in DOM.`);
      return;
    }

    const edgeColor = data?.color || '#94a3b8';
    const overlays: any[] = [
      ['Arrow', { location: 1, width: 12, length: 12, foldback: 0.8 }]
    ];

    if (data?.label && data.label !== 'Main') {
      overlays.push(['Label', {
        label: data.label,
        location: 0.2,
        cssClass: 'workflow-edge-label',
        id: 'label'
      }]);
    }

    try {
      this.instance.connect({
        source: sourceId,
        target: targetId,
        overlays,
        paintStyle: { stroke: edgeColor, strokeWidth: 2.5 },
        hoverPaintStyle: { stroke: edgeColor, strokeWidth: 4, opacity: 0.8 },
        parameters: { ...data, programmatic: true, id: data?.id }
      } as any);
    } catch (e) {
      console.error('jsPlumb.connect failed:', e);
    }
  }

  repaintEverything() {
    if (this.instance) {
      this.instance.repaintEverything();
    }
  }

  setZoom(zoom: number) {
    if (!this.instance || !this.container) return;
    
    // jsPlumb zoom is tricky, usually involves CSS transform + setZoom
    this.instance.setZoom(zoom);
    // Transform is handled by the component for better control
  }

  clear() {
    if (this.instance) {
      this.instance.deleteEveryConnection();
      this.instance.reset();
    }
  }

  // ─── Edge Runtime Styling ───────────────────────────────────────

  private edgeStateColors: Record<string, string> = {
    'inactive': '#94a3b8',
    'active': '#3b82f6',
    'success-path': '#22c55e',
    'failed-path': '#ef4444',
    'skipped-path': '#64748b'
  };

  private edgeStateWidths: Record<string, number> = {
    'inactive': 2,
    'active': 3,
    'success-path': 2.5,
    'failed-path': 2.5,
    'skipped-path': 1.5
  };

  updateEdgeState(edgeId: string, state: string) {
    if (!this.instance) return;
    const connections = this.instance.getAllConnections() as any[];
    const conn = connections.find(c => c.getParameter('id') === edgeId);
    if (!conn) return;

    const color = this.edgeStateColors[state] || '#94a3b8';
    const width = this.edgeStateWidths[state] || 2;

    const style: any = { stroke: color, strokeWidth: width };

    if (state === 'active') {
      style.dashstyle = '4 2';
    } else if (state === 'skipped-path') {
      style.dashstyle = '4 3';
    }

    conn.setPaintStyle(style);
    conn.setHoverPaintStyle({ stroke: color, strokeWidth: width + 1.5, opacity: 0.8 });

    // Handle SVG animation class (for custom pulse)
    const connector = conn.getConnector().canvas;
    if (connector) {
      if (state === 'active') {
        connector.classList.add('edge-active');
      } else {
        connector.classList.remove('edge-active');
      }
    }
  }

  resetAllEdgeStates() {
    if (!this.instance) return;
    const connections = this.instance.getAllConnections() as any[];
    connections.forEach(conn => {
      conn.setPaintStyle({ stroke: '#94a3b8', strokeWidth: 2 });
      conn.setHoverPaintStyle({ stroke: '#3b82f6', strokeWidth: 3 });
      const connector = conn.getConnector().canvas;
      if (connector) connector.classList.remove('edge-active');
    });
  }
}
