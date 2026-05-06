import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NODE_REGISTRY, NODE_GROUPS } from '../registry/node-registry';
import { WorkflowStateService } from '../services/workflow-state.service';

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="palette-container">
      <div class="palette-header">
        <h3>Node Library</h3>
        <p>Drag nodes onto the canvas</p>
      </div>

      <div class="groups-list">
        <div *ngFor="let group of groups" class="group-section">
          <div class="group-label" [style.color]="group.color">
            {{ group.label }}
          </div>
          
          <div class="nodes-grid">
            <div 
              *ngFor="let node of getNodesByGroup(group.id)" 
              class="node-item"
              [cdkDragData]="node.subType"
              cdkDrag
              (cdkDragStarted)="onDragStarted()"
            >
              <div class="node-icon" [style.background-color]="node.color">
                <span class="material-icons">{{ node.icon }}</span>
              </div>
              <div class="node-info">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-desc">{{ node.description }}</span>
              </div>
              
              <!-- Drag Preview -->
              <div *cdkDragPreview class="node-drag-preview" [style.border-left-color]="node.color">
                <span class="material-icons">{{ node.icon }}</span>
                {{ node.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .palette-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      overflow-y: auto;
    }

    .palette-header h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
    .palette-header p { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1.5rem; }

    .group-section { margin-bottom: 1.5rem; }
    .group-label { 
      font-size: 0.7rem; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
      opacity: 0.8;
    }

    .nodes-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .node-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: grab;
      transition: all 0.2s;
    }
    .node-item:hover {
      border-color: var(--accent);
      transform: translateX(4px);
      box-shadow: var(--card-shadow);
    }
    .node-item:active { cursor: grabbing; }

    .node-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .node-icon .material-icons { font-size: 1.2rem; }

    .node-info { display: flex; flex-direction: column; }
    .node-label { font-size: 0.85rem; font-weight: 600; }
    .node-desc { font-size: 0.7rem; color: var(--text-secondary); }

    .node-drag-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.85rem;
    }
  `]
})
export class NodePaletteComponent {
  groups = NODE_GROUPS;
  registry = Object.values(NODE_REGISTRY);

  getNodesByGroup(groupId: string) {
    return this.registry.filter(n => n.type === groupId);
  }

  onDragStarted() {
    // Optional: provide feedback to canvas
  }
}
