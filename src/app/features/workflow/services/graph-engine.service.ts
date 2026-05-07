import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { jsPlumb, jsPlumbInstance, Defaults } from 'jsplumb';
import { WorkflowNode, WorkflowEdge, Position } from '../models/workflow.model';

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

  initialize(container: HTMLElement) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.container = container;
    this.instance = jsPlumb.getInstance({
      ...this.JS_PLUMB_DEFAULTS,
      Container: container
    });

    // Global events
    this.instance.bind('connection', (info) => {
      // Handle programmatic or manual connection
      console.log('Connection created:', info.connection.id);
    });
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

  connect(sourceId: string, targetId: string, data?: any) {
    if (!this.instance) return;
    this.instance.connect({
      source: sourceId,
      target: targetId,
      parameters: data
    });
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
