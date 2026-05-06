import { Component, inject, ElementRef, ViewChild, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd, CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkflowStateService } from '../services/workflow-state.service';
import { NODE_REGISTRY } from '../registry/node-registry';
import { WorkflowNode, Position } from '../models/workflow.model';

@Component({
  selector: 'app-workflow-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div 
      class="canvas-container" 
      #canvasContainer
      (mousedown)="onCanvasMouseDown($event)"
      (mousemove)="onCanvasMouseMove($event)"
      (mouseup)="onCanvasMouseUp($event)"
      (wheel)="onWheel($event)"
      cdkDropList
      [cdkDropListData]="null"
      (cdkDropListDropped)="onDrop($event)"
    >
      <!-- Grid Background (Moves with Pan) -->
      <div 
        class="grid-background"
        [style.background-position]="state.panPosition().x + 'px ' + state.panPosition().y + 'px'"
        [style.background-size]="(24 * state.zoomLevel()) + 'px ' + (24 * state.zoomLevel()) + 'px'"
      ></div>

      <!-- Connection Lines (SVG Layer) -->
      <svg class="edges-layer" [style.transform]="'translate(' + state.panPosition().x + 'px, ' + state.panPosition().y + 'px) scale(' + state.zoomLevel() + ')'">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
          </marker>
        </defs>
        
        <!-- Existing Edges -->
        <path 
          *ngFor="let edge of state.edges()" 
          [attr.d]="calculatePath(edge.source, edge.target)"
          fill="none" 
          stroke="#94a3b8" 
          stroke-width="2"
          marker-end="url(#arrowhead)"
        />

        <!-- Active Connection (While Dragging) -->
        <path 
          *ngIf="pendingConnection()" 
          [attr.d]="calculatePendingPath()"
          fill="none" 
          stroke="var(--accent)" 
          stroke-width="2"
          stroke-dasharray="4"
          class="pending-edge"
        />
      </svg>

      <!-- Workflow Nodes Layer -->
      <div 
        class="nodes-layer"
        [style.transform]="'translate(' + state.panPosition().x + 'px, ' + state.panPosition().y + 'px) scale(' + state.zoomLevel() + ')'"
      >
        <div 
          *ngFor="let node of state.nodes()"
          class="node-wrapper"
          [style.left.px]="node.position.x"
          [style.top.px]="node.position.y"
          [class.selected]="state.selectedNode()?.id === node.id"
          [class.running]="node.status === 'running'"
          [class.success]="node.status === 'success'"
          [class.error]="node.status === 'error'"
          (mousedown)="onNodeMouseDown($event, node.id)"
          cdkDrag
          [cdkDragBoundary]="'.canvas-container'"
          (cdkDragEnded)="onNodeDragEnd($event, node)"
        >
          <!-- Node Content -->
          <div class="node-card">
            <div class="node-header" [style.background-color]="getRegistry(node.subType).color">
              <span class="material-icons">{{ getRegistry(node.subType).icon }}</span>
              <span class="node-type-label">{{ getRegistry(node.subType).label }}</span>
            </div>
            <div class="node-body">
              <div class="node-title">{{ node.label }}</div>
              <div class="node-status-icon" *ngIf="node.status !== 'idle'">
                <span *ngIf="node.status === 'running'" class="spinner"></span>
                <span *ngIf="node.status === 'success'">✅</span>
                <span *ngIf="node.status === 'error'">❌</span>
              </div>
            </div>

            <!-- Connection Points (Handles) -->
            <div class="handle handle-in" (mousedown)="onConnectionEnd($event, node.id)"></div>
            <div class="handle handle-out" (mousedown)="onConnectionStart($event, node.id)"></div>
          </div>
        </div>
      </div>

      <!-- Controls Overlay -->
      <div class="canvas-controls">
        <button (click)="resetView()" title="Reset View">
          <span class="material-icons">filter_center_focus</span>
        </button>
        <div class="zoom-info">{{ (state.zoomLevel() * 100) | number:'1.0-0' }}%</div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      width: 100%;
      height: 100%;
      position: relative;
      background: var(--bg-primary);
      overflow: hidden;
      cursor: grab;
    }
    .canvas-container:active:not(.connecting) { cursor: grabbing; }
    .canvas-container.connecting { cursor: crosshair; }

    .grid-background {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      pointer-events: none;
      z-index: 0;
    }

    .edges-layer {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: visible;
    }

    .nodes-layer {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      transform-origin: 0 0;
      z-index: 2;
    }

    .node-wrapper {
      position: absolute;
      width: 180px;
      z-index: 3;
    }

    .node-card {
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: var(--card-shadow);
      transition: border-color 0.2s, transform 0.2s;
      position: relative;
      user-select: none;
    }

    .node-wrapper.selected .node-card {
      border-color: var(--accent);
      box-shadow: 0 0 0 4px rgba(var(--accent-rgb), 0.1);
    }

    .node-header {
      padding: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: white;
    }
    .node-header .material-icons { font-size: 1.1rem; }
    .node-type-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }

    .node-body {
      padding: 0.75rem;
      background: var(--bg-secondary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .node-title { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }

    /* Handles */
    .handle {
      width: 10px;
      height: 10px;
      background: var(--bg-primary);
      border: 2px solid var(--border);
      border-radius: 50%;
      position: absolute;
      z-index: 10;
      cursor: crosshair;
      transition: all 0.2s;
    }
    .handle:hover {
      background: var(--accent);
      border-color: var(--accent);
      transform: scale(1.4);
    }
    .handle-in { left: -6px; top: 50%; transform: translateY(-50%); }
    .handle-out { right: -6px; top: 50%; transform: translateY(-50%); }

    /* Node Status States */
    .node-wrapper.running .node-card { border-color: var(--accent); animation: pulse 1.5s infinite; }
    .node-wrapper.success .node-card { border-color: #10b981; }
    .node-wrapper.error .node-card { border-color: #ef4444; }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(var(--accent-rgb), 0); }
      100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(var(--accent-rgb), 0.1);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .pending-edge {
      animation: dash 1s linear infinite;
    }
    @keyframes dash { to { stroke-dashoffset: -8; } }

    .canvas-controls {
      position: absolute;
      bottom: 1.5rem;
      right: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--bg-secondary);
      padding: 0.5rem 1rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      box-shadow: var(--card-shadow);
      z-index: 100;
    }
    .canvas-controls button {
      background: none;
      border: none;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      transition: color 0.2s;
    }
    .canvas-controls button:hover { color: var(--accent); }
    .zoom-info { font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); min-width: 40px; text-align: center; }
  `]
})
export class WorkflowCanvasComponent {
  state = inject(WorkflowStateService);
  
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  // Panning State
  private isPanning = false;
  private lastMousePos: Position = { x: 0, y: 0 };

  // Connection State
  pendingConnection = signal<{ sourceId: string, mouseX: number, mouseY: number } | null>(null);

  getRegistry(subType: string) {
    return NODE_REGISTRY[subType];
  }

  onDrop(event: CdkDragDrop<any>) {
    if (typeof event.item.data === 'string') {
      const containerRect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const x = (event.dropPoint.x - containerRect.left - this.state.panPosition().x) / this.state.zoomLevel();
      const y = (event.dropPoint.y - containerRect.top - this.state.panPosition().y) / this.state.zoomLevel();
      
      this.state.addNode(event.item.data, { x, y });
    }
  }

  onNodeDragEnd(event: CdkDragEnd, node: WorkflowNode) {
    const transform = event.source.getFreeDragPosition();
    this.state.updateNodePosition(node.id, {
      x: node.position.x + transform.x / this.state.zoomLevel(),
      y: node.position.y + transform.y / this.state.zoomLevel()
    });
    event.source.reset();
  }

  onNodeMouseDown(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    this.state.selectNode(nodeId);
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (event.button === 0) { // Left click on background
      this.state.selectNode(null);
      this.isPanning = true;
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onCanvasMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const dx = event.clientX - this.lastMousePos.x;
      const dy = event.clientY - this.lastMousePos.y;
      
      this.state.setPan({
        x: this.state.panPosition().x + dx,
        y: this.state.panPosition().y + dy
      });
      
      this.lastMousePos = { x: event.clientX, y: event.clientY };
    }

    if (this.pendingConnection()) {
      const containerRect = this.canvasContainer.nativeElement.getBoundingClientRect();
      const x = (event.clientX - containerRect.left - this.state.panPosition().x) / this.state.zoomLevel();
      const y = (event.clientY - containerRect.top - this.state.panPosition().y) / this.state.zoomLevel();
      
      this.pendingConnection.update(pc => pc ? { ...pc, mouseX: x, mouseY: y } : null);
    }
  }

  @HostListener('window:mouseup')
  onCanvasMouseUp(event: MouseEvent) {
    this.isPanning = false;
    this.pendingConnection.set(null);
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.state.setZoom(this.state.zoomLevel() + delta);
  }

  resetView() {
    this.state.setPan({ x: 0, y: 0 });
    this.state.setZoom(1);
  }

  // --- Connection Logic ---
  onConnectionStart(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    const containerRect = this.canvasContainer.nativeElement.getBoundingClientRect();
    const x = (event.clientX - containerRect.left - this.state.panPosition().x) / this.state.zoomLevel();
    const y = (event.clientY - containerRect.top - this.state.panPosition().y) / this.state.zoomLevel();

    this.pendingConnection.set({
      sourceId: nodeId,
      mouseX: x,
      mouseY: y
    });
  }

  onConnectionEnd(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    const pc = this.pendingConnection();
    if (pc && pc.sourceId !== nodeId) {
      this.state.addEdge(pc.sourceId, nodeId);
    }
    this.pendingConnection.set(null);
  }

  calculatePath(sourceId: string, targetId: string): string {
    const sourceNode = this.state.nodes().find(n => n.id === sourceId);
    const targetNode = this.state.nodes().find(n => n.id === targetId);

    if (!sourceNode || !targetNode) return '';

    const startX = sourceNode.position.x + 180;
    const startY = sourceNode.position.y + 40;
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 40;

    return this.generateBezier(startX, startY, endX, endY);
  }

  calculatePendingPath(): string {
    const pc = this.pendingConnection();
    if (!pc) return '';

    const sourceNode = this.state.nodes().find(n => n.id === pc.sourceId);
    if (!sourceNode) return '';

    const startX = sourceNode.position.x + 180;
    const startY = sourceNode.position.y + 40;
    
    return this.generateBezier(startX, startY, pc.mouseX, pc.mouseY);
  }

  private generateBezier(x1: number, y1: number, x2: number, y2: number): string {
    const dx = Math.abs(x2 - x1);
    const controlPointOffset = Math.max(dx / 2, 40);
    return `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
  }
}
