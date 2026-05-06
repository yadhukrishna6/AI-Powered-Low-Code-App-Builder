import { Component, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
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
      (wheel)="onWheel($event)"
      cdkDropList
      [cdkDropListData]="null"
      (cdkDropListDropped)="onDrop($event)"
    >
      <!-- Connection Lines (SVG Layer) -->
      <svg class="edges-layer">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--text-secondary)" />
          </marker>
        </defs>
        <path 
          *ngFor="let edge of state.edges()" 
          [attr.d]="calculatePath(edge.source, edge.target)"
          fill="none" 
          stroke="var(--text-secondary)" 
          stroke-width="2"
          marker-end="url(#arrowhead)"
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
            <div class="handle handle-in" (mousedown)="onConnectionStart($event, node.id, 'in')"></div>
            <div class="handle handle-out" (mousedown)="onConnectionStart($event, node.id, 'out')"></div>
          </div>
        </div>
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
      cursor: crosshair;
    }

    .edges-layer {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 1;
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
    }

    .node-wrapper.selected .node-card {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.2);
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
      width: 12px;
      height: 12px;
      background: var(--bg-secondary);
      border: 2px solid var(--text-secondary);
      border-radius: 50%;
      position: absolute;
      z-index: 10;
      cursor: pointer;
    }
    .handle:hover {
      background: var(--accent);
      border-color: var(--accent);
    }
    .handle-in { left: -7px; top: 50%; transform: translateY(-50%); }
    .handle-out { right: -7px; top: 50%; transform: translateY(-50%); }

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
  `]
})
export class WorkflowCanvasComponent {
  state = inject(WorkflowStateService);
  
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  getRegistry(subType: string) {
    return NODE_REGISTRY[subType];
  }

  onDrop(event: CdkDragDrop<any>) {
    // If dropped from palette
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
      x: node.position.x + transform.x,
      y: node.position.y + transform.y
    });
    event.source.reset();
  }

  onNodeMouseDown(event: MouseEvent, nodeId: string) {
    event.stopPropagation();
    this.state.selectNode(nodeId);
  }

  onCanvasMouseDown(event: MouseEvent) {
    this.state.selectNode(null);
    // Pan logic would go here
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.state.setZoom(this.state.zoomLevel() + delta);
  }

  // --- Connection Logic (simplified for MVP) ---
  pendingConnectionSource: string | null = null;

  onConnectionStart(event: MouseEvent, nodeId: string, type: 'in' | 'out') {
    event.stopPropagation();
    if (type === 'out') {
      this.pendingConnectionSource = nodeId;
    } else if (this.pendingConnectionSource) {
      this.state.addEdge(this.pendingConnectionSource, nodeId);
      this.pendingConnectionSource = null;
    }
  }

  calculatePath(sourceId: string, targetId: string): string {
    const sourceNode = this.state.nodes().find(n => n.id === sourceId);
    const targetNode = this.state.nodes().find(n => n.id === targetId);

    if (!sourceNode || !targetNode) return '';

    const startX = sourceNode.position.x + 180;
    const startY = sourceNode.position.y + 40;
    const endX = targetNode.position.x;
    const endY = targetNode.position.y + 40;

    const controlPointOffset = Math.abs(endX - startX) / 2;
    
    return `M ${startX} ${startY} C ${startX + controlPointOffset} ${startY}, ${endX - controlPointOffset} ${endY}, ${endX} ${endY}`;
  }
}
