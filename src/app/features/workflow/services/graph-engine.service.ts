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
  onConnection(callback: (info: any) => void) {
    this.connectionCallback = callback;
  }

  addNode(nodeId: string) {
    if (!this.instance) return;

    const el = document.getElementById(nodeId);
    if (!el) return;

    this.instance.draggable(el, {
      containment: 'parent',
      grid: [20, 20], // Grid snapping
      stop: (params: any) => {
        // Emit new position
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

  removeEdgeById(edgeId: string) {
    if (!this.instance) return;
    const connections = this.instance.getAllConnections() as any[];
    const conn = connections.find(c => c.getParameter('id') === edgeId);
    if (conn) {
      this.instance.deleteConnection(conn);
    }
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
    this.container.style.transform = `scale(${zoom})`;
    this.container.style.transformOrigin = '0 0';
  }

  clear() {
    if (this.instance) {
      this.instance.deleteEveryConnection();
      this.instance.reset();
    }
  }
}
