import { 
  Component, 
  inject, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  OnDestroy,
  effect,
  signal,
  HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkflowStateService } from '../services/workflow-state.service';
import { GraphEngineService } from '../services/graph-engine.service';
import { NodeRegistryService } from '../registry/node-registry.service';
import { WorkflowNode, Position } from '../models/workflow.model';

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div 
      class="canvas-container" 
      #canvasContainer
      id="workflow-canvas"
      (mousedown)="onCanvasMouseDown($event)"
      (wheel)="onWheel($event)"
      cdkDropList
      [cdkDropListData]="null"
      (cdkDropListDropped)="onDrop($event)"
    >
      <!-- Grid Background -->
      <div 
        class="grid-background"
        [style.background-position]="state.panPosition().x + 'px ' + state.panPosition().y + 'px'"
        [style.background-size]="(24 * state.zoomLevel()) + 'px ' + (24 * state.zoomLevel()) + 'px'"
      ></div>

      <!-- jsPlumb Nodes Container -->
      <div 
        class="nodes-container"
        #nodesContainer
        [style.transform]="'translate(' + state.panPosition().x + 'px, ' + state.panPosition().y + 'px) scale(' + state.zoomLevel() + ')'"
      >
        <div 
          *ngFor="let node of state.nodes(); trackBy: trackByNode"
          [id]="node.id"
          class="workflow-node"
          [class.selected]="state.workflow().nodes[0].id === node.id" 
          [style.left.px]="node.position.x"
          [style.top.px]="node.position.y"
          [class.status-running]="node.status === 'running'"
          [class.status-success]="node.status === 'success'"
          [class.status-error]="node.status === 'error'"
          (mousedown)="onNodeMouseDown($event, node.id)"
        >
          <div class="node-card">
            <div class="node-header" [style.background-color]="registry.getEntry(node.subType).color">
              <span class="material-icons">{{ registry.getEntry(node.subType).icon }}</span>
              <span class="node-type">{{ registry.getEntry(node.subType).label }}</span>
            </div>
            
            <div class="node-content">
              <div class="node-title">{{ node.label }}</div>
              <div class="node-status" *ngIf="node.status !== 'idle'">
                <span *ngIf="node.status === 'running'" class="status-spinner"></span>
                <span *ngIf="node.status === 'success'">✅</span>
                <span *ngIf="node.status === 'error'">❌</span>
              </div>
            </div>

            <!-- Connection Anchors (jsPlumb will target these) -->
            <div class="anchor anchor-in handle-in" title="Input"></div>
            <div class="anchor anchor-out handle-out" title="Output"></div>
          </div>
        </div>
      </div>

      <!-- Canvas UI Controls -->
      <div class="canvas-ui">
        <div class="zoom-pill">
          <button (click)="adjustZoom(-0.1)"><span class="material-icons">remove</span></button>
          <span>{{ (state.zoomLevel() * 100) | number:'1.0-0' }}%</span>
          <button (click)="adjustZoom(0.1)"><span class="material-icons">add</span></button>
          <button class="reset" (click)="resetView()"><span class="material-icons">filter_center_focus</span></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }

    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: var(--bg-primary);
      overflow: hidden;
      cursor: grab;
    }

    .canvas-container:active { cursor: grabbing; }

    .grid-background {
      position: absolute;
      top: 0; left: 0;
      right: 0; bottom: 0;
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      pointer-events: none;
    }

    .nodes-container {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      transform-origin: 0 0;
      z-index: 2;
    }

    .workflow-node {
      position: absolute;
      width: 200px;
      z-index: 10;
      cursor: default;
    }

    .node-card {
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      border-radius: 12px;
      overflow: visible; /* Important for anchors */
      box-shadow: var(--card-shadow);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .workflow-node.selected .node-card {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
    }

    .node-header {
      padding: 6px 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      border-radius: 10px 10px 0 0;
    }

    .node-header .material-icons { font-size: 1.1rem; }
    .node-type { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }

    .node-content {
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .node-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }

    /* Anchors */
    .anchor {
      width: 10px;
      height: 10px;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 50%;
      position: absolute;
      z-index: 20;
      cursor: crosshair;
      transition: all 0.2s;
    }

    .anchor:hover {
      background: var(--accent);
      border-color: var(--accent);
      transform: scale(1.3);
    }

    .anchor-in { left: -6px; top: 50%; transform: translateY(-50%); }
    .anchor-out { right: -6px; top: 50%; transform: translateY(-50%); }

    /* Status Animations */
    .workflow-node.status-running .node-card { border-color: var(--accent); animation: pulse 1.5s infinite; }
    .workflow-node.status-success .node-card { border-color: #10b981; }
    .workflow-node.status-error .node-card { border-color: #ef4444; }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(var(--accent-rgb), 0); }
      100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
    }

    .status-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(var(--accent-rgb), 0.1);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .canvas-ui {
      position: absolute;
      bottom: 24px;
      right: 24px;
      z-index: 100;
    }

    .zoom-pill {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      padding: 4px 8px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--card-shadow);
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .zoom-pill button {
      width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
      color: var(--text-primary);
      transition: all 0.2s;
    }
    .zoom-pill button:hover { background: var(--input-bg); color: var(--accent); }
    .zoom-pill button .material-icons { font-size: 1.1rem; }
    .zoom-pill .reset { border-left: 1px solid var(--border); border-radius: 0; padding-left: 12px; margin-left: 4px; }
  `]
})
export class WorkflowCanvasComponent implements AfterViewInit, OnDestroy {
  state = inject(WorkflowStateService);
  graph = inject(GraphEngineService);
  registry = inject(NodeRegistryService);

  @ViewChild('canvasContainer') canvasContainer!: ElementRef;
  @ViewChild('nodesContainer') nodesContainer!: ElementRef;

  private isPanning = false;
  private lastMousePos: Position = { x: 0, y: 0 };

  private previousNodeIds = new Set<string>();

  constructor() {
    // Sync jsPlumb with state changes
    effect(() => {
      const currentNodes = this.state.nodes();
      const currentIds = new Set(currentNodes.map(n => n.id));

      // Handle Removals
      this.previousNodeIds.forEach(id => {
        if (!currentIds.has(id)) {
          this.graph.removeNode(id);
        }
      });

      // Handle Additions
      setTimeout(() => {
        currentNodes.forEach(node => {
          if (!this.previousNodeIds.has(node.id)) {
            this.graph.addNode(node.id);
          }
        });
        this.previousNodeIds = currentIds;
      }, 0);
    });
    effect(() => {
      const edges = this.state.edges();
      setTimeout(() => this.syncEdgesWithGraph(edges), 0);
    });
  }

  ngAfterViewInit() {
    this.graph.initialize(this.nodesContainer.nativeElement);
  }

  ngOnDestroy() {
    this.graph.clear();
  }

  private syncEdgesWithGraph(edges: any[]) {
    // Programmatic connections from state
    edges.forEach(edge => {
      this.graph.connect(edge.source, edge.target, edge);
    });
  }

  trackByNode(index: number, node: WorkflowNode) {
    return node.id;
  }

  onDrop(event: CdkDragDrop<any>) {
    if (typeof event.item.data === 'string') {
      const containerRect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const x = (event.dropPoint.x - containerRect.left - this.state.panPosition().x) / this.state.zoomLevel();
      const y = (event.dropPoint.y - containerRect.top - this.state.panPosition().y) / this.state.zoomLevel();
      
      this.state.addNode(event.item.data, { x, y });
    }
  }

  onNodeMouseDown(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    this.state.selectNode(nodeId);
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this.state.selectNode(null);
      this.isPanning = true;
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      
      this.state.setPan({
        x: this.state.panPosition().x + dx,
        y: this.state.panPosition().y + dy
      });
      
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isPanning = false;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.adjustZoom(delta);
  }

  adjustZoom(delta: number) {
    const newZoom = this.state.zoomLevel() + delta;
    this.state.setZoom(newZoom);
    this.graph.setZoom(newZoom);
  }

  resetView() {
    this.state.setPan({ x: 0, y: 0 });
    this.state.setZoom(1);
    this.graph.setZoom(1);
  }
}
