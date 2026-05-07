import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NodeRegistryService } from '../registry/node-registry.service';
import { WorkflowStateService } from '../services/workflow-state.service';

@Component({
  selector: 'app-node-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="palette-container">
      <div class="palette-header">
        <h3>Node Library</h3>
        <p>Drag components onto the graph</p>
      </div>

      <div class="groups-list">
        <div *ngFor="let group of registry.NODE_GROUPS" class="group-section">
          <div class="group-label" [style.color]="group.color">
            {{ group.label }}
          </div>
          
          <div 
            class="nodes-grid"
            cdkDropList
            [cdkDropListData]="registry.getEntriesByType(group.id)"
            [cdkDropListConnectedTo]="['workflow-canvas']"
            [cdkDropListSortingDisabled]="true"
          >
            <div 
              *ngFor="let entry of registry.getEntriesByType(group.id)" 
              class="node-item"
              [cdkDragData]="entry.subType"
              cdkDrag
              cdkDragPreviewContainer="global"
            >
              <div class="node-icon" [style.background-color]="entry.color">
                <span class="material-icons">{{ entry.icon }}</span>
              </div>
              <div class="node-info">
                <span class="node-label">{{ entry.label }}</span>
                <span class="node-desc">{{ entry.description }}</span>
              </div>
              
              <!-- Drag Preview -->
              <div *cdkDragPreview class="node-drag-preview" [style.border-left-color]="entry.color">
                <span class="material-icons">{{ entry.icon }}</span>
                {{ entry.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }

    .palette-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.25rem;
      overflow-y: auto;
      box-sizing: border-box;
      background: var(--bg-secondary);
    }

    .palette-header h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--text-primary); }
    .palette-header p { font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 1.5rem; }

    .group-section { margin-bottom: 1.5rem; }
    .group-label { 
      font-size: 0.65rem; 
      font-weight: 800; 
      text-transform: uppercase; 
      letter-spacing: 0.08em;
      margin-bottom: 0.75rem;
      opacity: 0.7;
    }

    .nodes-grid { display: flex; flex-direction: column; gap: 0.6rem; }

    .node-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: grab;
      transition: all 0.2s;
    }
    .node-item:hover {
      border-color: var(--accent);
      background: rgba(var(--accent-rgb), 0.05);
      transform: translateY(-1px);
    }

    .node-icon {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: white;
    }
    .node-icon .material-icons { font-size: 1.1rem; }

    .node-info { flex: 1; min-width: 0; }
    .node-label { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); display: block; }
    .node-desc { font-size: 0.65rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

    .node-drag-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      border-radius: 8px;
      box-shadow: 0 10px 20px rgba(0,0,0,0.2);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.85rem;
      z-index: 10000;
    }
  `]
})
export class NodePaletteComponent {
  registry = inject(NodeRegistryService);
}
