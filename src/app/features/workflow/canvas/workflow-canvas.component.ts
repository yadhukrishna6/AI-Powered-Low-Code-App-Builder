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
import { WorkflowNode, WorkflowEdge, Position } from '../models/workflow.model';

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
      (mousemove)="onCanvasMouseMove($event)"
      (mouseup)="onCanvasMouseUp($event)"
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
          [class.selected]="state.selectedNode()?.id === node.id" 
          [style.left.px]="node.position.x"
          [style.top.px]="node.position.y"
          [class.status-idle]="node.status === 'idle'"
          [class.status-queued]="node.status === 'queued'"
          [class.status-running]="node.status === 'running'"
          [class.status-success]="node.status === 'success'"
          [class.status-error]="node.status === 'error' || node.status === 'failed'"
          [class.status-waiting]="node.status === 'waiting'"
          [class.status-skipped]="node.status === 'skipped'"
          [class.status-cancelled]="node.status === 'cancelled'"
          (mousedown)="onNodeMouseDown($event, node.id)"
        >
          <!-- ... node content ... -->
          <div class="node-card">
            <div class="node-header" [style.background-color]="registry.getEntry(node.subType).color">
              <span class="material-icons">{{ registry.getEntry(node.subType).icon }}</span>
              <span class="node-type">{{ registry.getEntry(node.subType).label }}</span>
            </div>
            
            <div class="node-content">
              <div class="node-title">{{ node.label }}</div>
              <div class="node-status-badge" *ngIf="node.status !== 'idle'">
                <ng-container [ngSwitch]="node.status">
                  <span *ngSwitchCase="'running'" class="badge badge-running"><span class="material-icons icon-spin">sync</span></span>
                  <span *ngSwitchCase="'success'" class="badge badge-success"><span class="material-icons">check_circle</span></span>
                  <span *ngSwitchCase="'failed'" class="badge badge-error"><span class="material-icons">error</span></span>
                  <span *ngSwitchDefault class="badge"><span class="material-icons">hourglass_empty</span></span>
                </ng-container>
              </div>
            </div>

            <div class="anchor anchor-in handle-in"></div>
            <div *ngIf="node.subType !== 'end'" class="anchor anchor-out handle-out"></div>
          </div>
        </div>

        <!-- Lasso Selection Box -->
        <div *ngIf="lassoActive" class="lasso-box" [style.left.px]="lassoBox.x" [style.top.px]="lassoBox.y" [style.width.px]="lassoBox.w" [style.height.px]="lassoBox.h"></div>
      </div>

      <!-- ─── Mini Map ─── -->
      <div class="mini-map glass">
        <div class="mini-map-content">
           <div *ngFor="let node of state.nodes()" 
                class="mini-node"
                [style.left.px]="node.position.x * 0.1" 
                [style.top.px]="node.position.y * 0.1">
           </div>
           <div class="mini-viewport" 
                [style.left.px]="-state.panPosition().x * 0.1 / state.zoomLevel()"
                [style.top.px]="-state.panPosition().y * 0.1 / state.zoomLevel()"
                [style.width.px]="viewportSize.w * 0.1 / state.zoomLevel()"
                [style.height.px]="viewportSize.h * 0.1 / state.zoomLevel()">
           </div>
        </div>
      </div>

      <!-- Canvas UI Controls -->
      <div class="canvas-ui">
        <div class="zoom-pill">
          <button (click)="adjustZoom(-0.1, null)"><span class="material-icons">remove</span></button>
          <span>{{ (state.zoomLevel() * 100) | number:'1.0-0' }}%</span>
          <button (click)="adjustZoom(0.1, null)"><span class="material-icons">add</span></button>
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
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: visible; /* Important for anchors */
      box-shadow: 0 4px 15px rgba(0,0,0,0.25);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .node-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      border-radius: 11px;
      background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%);
      pointer-events: none;
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
      border-color: var(--accent) !important;
      transform: scale(1.4) translateY(-35%);
      box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.4);
    }

    .anchor-in { left: -6px; top: 50%; transform: translateY(-50%); }
    .anchor-out { right: -6px; top: 50%; transform: translateY(-50%); }

    /* Type-specific Anchor Colors */
    .anchor-trigger { border-color: #10b981 !important; }
    .anchor-action { border-color: #3b82f6 !important; }
    .anchor-logic { border-color: #f59e0b !important; }

    /* Edge Labels */
    ::ng-deep .workflow-edge-label {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      pointer-events: none;
      z-index: 100;
    }

    /* ─── Runtime Status Badges ─── */
    .node-status-badge { display: flex; align-items: center; }
    .badge {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%;
    }
    .badge .material-icons { font-size: 1.1rem; }

    .badge-queued { color: #a78bfa; }
    .badge-running { color: #3b82f6; }
    .badge-success { color: #22c55e; }
    .badge-error { color: #ef4444; }
    .badge-waiting { color: #f59e0b; }
    .badge-skipped { color: #94a3b8; }
    .badge-cancelled { color: #6b7280; }

    .icon-spin { animation: icon-rotate 1s linear infinite; }
    @keyframes icon-rotate { to { transform: rotate(360deg); } }

    /* ─── Error Bar ─── */
    .node-error-bar {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.08);
      border-top: 1px solid rgba(239, 68, 68, 0.15);
      border-radius: 0 0 12px 12px;
      color: #ef4444;
    }
    .node-error-bar .material-icons { font-size: 0.85rem; }
    .error-text { font-size: 0.65rem; font-weight: 600; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }

    /* ─── Node Execution State Animations ─── */

    /* Queued — subtle purple border */
    .workflow-node.status-queued .node-card {
      border-color: #a78bfa;
      box-shadow: 0 0 0 3px rgba(167,139,250,0.1);
    }

    /* Running — blue glow + pulsing shadow */
    .workflow-node.status-running .node-card {
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.15), 0 0 24px rgba(59,130,246,0.08);
      animation: pulse-running 2s ease-in-out infinite;
    }
    @keyframes pulse-running {
      0%, 100% { box-shadow: 0 0 0 4px rgba(59,130,246,0.15), 0 0 24px rgba(59,130,246,0.08); }
      50% { box-shadow: 0 0 0 6px rgba(59,130,246,0.25), 0 0 32px rgba(59,130,246,0.15); }
    }

    /* Success — green glow + pop-in */
    .workflow-node.status-success .node-card {
      border-color: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.12);
      animation: pop-success 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes pop-success {
      0% { transform: scale(1); }
      50% { transform: scale(1.03); }
      100% { transform: scale(1); }
    }

    /* Error/Failed — red glow + shake */
    .workflow-node.status-error .node-card {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.12);
      animation: shake-error 0.5s cubic-bezier(.36,.07,.19,.97);
    }
    @keyframes shake-error {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
      20%, 40%, 60%, 80% { transform: translateX(3px); }
    }

    /* Waiting — amber pulse */
    .workflow-node.status-waiting .node-card {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
      animation: pulse-waiting 2.5s ease-in-out infinite;
    }
    @keyframes pulse-waiting {
      0%, 100% { box-shadow: 0 0 0 3px rgba(245,158,11,0.12); }
      50% { box-shadow: 0 0 0 6px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.08); }
    }

    /* Skipped — faded + dashed */
    .workflow-node.status-skipped .node-card {
      opacity: 0.45;
      border-style: dashed;
      border-color: var(--border);
      filter: saturate(0.4);
    }

    /* Cancelled — gray + dimmed */
    .workflow-node.status-cancelled .node-card {
      opacity: 0.35;
      filter: grayscale(1);
      border-color: #6b7280;
    }

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

    /* ─── Lasso Selection ─── */
    .lasso-box {
      position: absolute;
      border: 1px solid rgba(59, 130, 246, 0.5);
      background: rgba(59, 130, 246, 0.1);
      z-index: 1000;
      pointer-events: none;
    }

    /* ─── Mini Map ─── */
    .mini-map {
      position: absolute;
      bottom: 24px;
      left: 24px;
      width: 200px;
      height: 150px;
      border-radius: 12px;
      overflow: hidden;
      z-index: 100;
      border: 1px solid var(--border);
    }
    .mini-map-content { position: relative; width: 100%; height: 100%; background: rgba(0,0,0,0.2); }
    .mini-node { position: absolute; width: 10px; height: 6px; background: var(--accent); border-radius: 2px; opacity: 0.6; }
    .mini-viewport { 
      position: absolute; 
      border: 1px solid white; 
      background: rgba(255,255,255,0.05); 
      pointer-events: none; 
      transition: all 0.1s linear;
    }

    .glass {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(10px);
    }
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
  private renderedEdgeIds = new Set<string>();

  // ─── n8n Style State ───
  lassoActive = false;
  lassoStart: Position = { x: 0, y: 0 };
  lassoBox = { x: 0, y: 0, w: 0, h: 0 };
  viewportSize = { w: 0, h: 0 };

  constructor() {
    // Consolidated sync logic: Ensure nodes are added BEFORE edges are connected
    effect(() => {
      const nodes = this.state.nodes();
      const edges = this.state.edges();
      
      // We use a small timeout to ensure Angular has finished rendering the DOM nodes
      setTimeout(() => {
        // 1. Sync Nodes
        const currentIds = new Set(nodes.map(n => n.id));
        
        // Remove old nodes
        this.previousNodeIds.forEach(id => {
          if (!currentIds.has(id)) this.graph.removeNode(id);
        });

        // Add new nodes
        nodes.forEach(node => {
          if (!this.previousNodeIds.has(node.id)) {
            this.graph.addNode(node.id);
          }
        });
        this.previousNodeIds = currentIds;

        // 2. Sync Edges (after nodes are guaranteed to be in the DOM and jsPlumb)
        this.syncEdgesWithGraph(edges);
      }, 0);
    });
  }

  ngAfterViewInit() {
    this.graph.initialize(this.nodesContainer.nativeElement);
    
    // Initial viewport size for mini-map
    this.updateViewportSize();

    // Listen for manual connections made on the canvas
    this.graph.onConnection(async (info) => {
      // ... existing connection logic ...
      this.graph.detachConnection(info.connection);
      const sourceNode = this.state.nodes().find(n => n.id === info.sourceId);
      if (!sourceNode) return;
      const registryEntry = this.registry.getEntry(sourceNode.subType);
      const branches = registryEntry.branches || [{ id: 'main', label: 'Main' }];
      if (branches.length <= 1) {
        this.state.addEdge(info.sourceId, info.targetId, branches[0].id);
        return;
      }
      const existingEdges = this.state.edges().filter(e => e.source === info.sourceId);
      const availableBranches = branches.filter(b => !existingEdges.some(e => e.sourceAnchor === b.id));
      if (availableBranches.length === 0) return;
      const selection = await this.state.promptBranchSelection(availableBranches);
      if (selection) {
        this.state.addEdge(info.sourceId, info.targetId, selection);
      }
    });

    // Handle node position updates (persisting snapping)
    this.graph.onDragStop((info) => {
      this.state.updateNodePosition(info.nodeId, info.position);
    });
  }

  private updateViewportSize() {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
    this.viewportSize = { w: rect.width, h: rect.height };
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewportSize();
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (event.button === 0) {
      this.state.selectNode(null);
      
      if (event.shiftKey) {
        // Start Lasso
        this.lassoActive = true;
        const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
        this.lassoStart = { 
          x: (event.clientX - rect.left - this.state.panPosition().x) / this.state.zoomLevel(),
          y: (event.clientY - rect.top - this.state.panPosition().y) / this.state.zoomLevel()
        };
        this.lassoBox = { x: this.lassoStart.x, y: this.lassoStart.y, w: 0, h: 0 };
      } else {
        // Start Pan
        this.isPanning = true;
        this.lastMousePos = { x: event.clientX, y: event.clientY };
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent) {
    const rect = this.canvasContainer.nativeElement.getBoundingClientRect();

    if (this.isPanning) {
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      this.state.setPan({
        x: this.state.panPosition().x + dx,
        y: this.state.panPosition().y + dy
      });
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    } else if (this.lassoActive) {
      const currentX = (event.clientX - rect.left - this.state.panPosition().x) / this.state.zoomLevel();
      const currentY = (event.clientY - rect.top - this.state.panPosition().y) / this.state.zoomLevel();
      
      this.lassoBox = {
        x: Math.min(this.lassoStart.x, currentX),
        y: Math.min(this.lassoStart.y, currentY),
        w: Math.abs(currentX - this.lassoStart.x),
        h: Math.abs(currentY - this.lassoStart.y)
      };
    }
  }

  onCanvasMouseUp(event: MouseEvent) {
    if (this.lassoActive) {
      // Multi-select nodes within lasso box
      const selected = this.state.nodes().filter(node => 
        node.position.x >= this.lassoBox.x && 
        node.position.x <= this.lassoBox.x + this.lassoBox.w &&
        node.position.y >= this.lassoBox.y &&
        node.position.y <= this.lassoBox.y + this.lassoBox.h
      );
      
      if (selected.length > 0) {
        this.state.selectNode(selected[0].id); // For now select first, in future support multi-select signal
      }
    }
    
    this.isPanning = false;
    this.lassoActive = false;
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.adjustZoom(delta, event);
  }

  adjustZoom(delta: number, event: MouseEvent | null) {
    const oldZoom = this.state.zoomLevel();
    const newZoom = Math.max(0.1, Math.min(2, oldZoom + delta));
    
    if (event) {
      // Zoom relative to mouse position (n8n style)
      const rect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const worldX = (mouseX - this.state.panPosition().x) / oldZoom;
      const worldY = (mouseY - this.state.panPosition().y) / oldZoom;

      const newPanX = mouseX - worldX * newZoom;
      const newPanY = mouseY - worldY * newZoom;

      this.state.setPan({ x: newPanX, y: newPanY });
    }

    this.state.setZoom(newZoom);
    this.graph.setZoom(newZoom);
  }

  resetView() {
    this.state.setPan({ x: 0, y: 0 });
    this.state.setZoom(1);
    this.graph.setZoom(1);
  }

  ngOnDestroy() {
    this.graph.destroy();
  }

  trackByNode(index: number, node: any) {
    return node.id;
  }

  onDrop(event: CdkDragDrop<any>) {
    const nodeType = event.item.data;
    const containerRect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const pan = this.state.panPosition();
    const zoom = this.state.zoomLevel();
    
    const x = (event.dropPoint.x - containerRect.left - pan.x) / zoom;
    const y = (event.dropPoint.y - containerRect.top - pan.y) / zoom;

    this.state.addNode(nodeType, { x, y });
  }

  private syncEdgesWithGraph(edges: any[]) {
    const currentEdgeIds = new Set(edges.map(e => e.id));
    this.renderedEdgeIds.forEach(id => {
      if (!currentEdgeIds.has(id)) this.graph.removeEdge(id);
    });

    edges.forEach(edge => {
      if (!this.renderedEdgeIds.has(edge.id)) {
        this.graph.connectNodes(edge.source, edge.target, {
          id: edge.id,
          sourceHandle: edge.sourceHandle || edge.sourceAnchor,
          targetHandle: edge.targetHandle || edge.targetAnchor,
        });
      }
    });
    this.renderedEdgeIds = currentEdgeIds;
  }
}
