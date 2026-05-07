import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStateService } from '../services/workflow-state.service';
import { NodeRegistryService } from '../registry/node-registry.service';
import { ModalService } from '../../../core/services/modal.service';
import { DynamicPropertyComponent } from './dynamic-property.component';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, DynamicPropertyComponent],
  template: `
    <div class="properties-container">
      <div *ngIf="state.selectedNode() as node; else emptyState">
        <header class="panel-header" [style.border-left-color]="registry.getEntry(node.subType).color">
          <div class="header-main">
            <div class="type-icon" [style.background-color]="registry.getEntry(node.subType).color">
              <span class="material-icons">{{ registry.getEntry(node.subType).icon }}</span>
            </div>
            <div class="header-text">
              <h3>{{ registry.getEntry(node.subType).label }}</h3>
              <span class="node-id">{{ node.id }}</span>
            </div>
          </div>
          <button class="delete-btn" (click)="deleteNode(node.id)" title="Delete Node">
            <span class="material-icons">delete_outline</span>
          </button>
        </header>

        <div class="panel-content thin-scrollbar">
          <!-- General Section -->
          <div class="prop-section">
            <h4 class="section-title">General Configuration</h4>
            <div class="field">
              <label>Node Name</label>
              <input type="text" [(ngModel)]="node.label" (ngModelChange)="updateNode(node)">
            </div>
            
            <div class="field">
              <label>Change Node Type</label>
              <select [ngModel]="node.subType" (ngModelChange)="convertNode(node, $event)">
                <optgroup label="Triggers">
                  <option *ngFor="let entry of registry.getEntriesByType('trigger')" [value]="entry.subType">
                    {{ entry.label }}
                  </option>
                </optgroup>
                <optgroup label="Logic">
                  <option *ngFor="let entry of registry.getEntriesByType('logic')" [value]="entry.subType">
                    {{ entry.label }}
                  </option>
                </optgroup>
                <optgroup label="Actions">
                  <option *ngFor="let entry of registry.getEntriesByType('action')" [value]="entry.subType">
                    {{ entry.label }}
                  </option>
                </optgroup>
              </select>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Dynamic Configuration -->
          <div class="prop-section">
            <h4 class="section-title">Node Parameters</h4>
            
            <div class="dynamic-fields">
              <app-dynamic-property 
                *ngFor="let prop of registry.getEntry(node.subType).properties"
                [property]="prop"
                [data]="node.data"
                (change)="updateNode(node)">
              </app-dynamic-property>

              <div *ngIf="!registry.getEntry(node.subType).properties?.length" class="info-alert">
                <span class="material-icons">info</span>
                <p>This node uses default execution parameters. No custom configuration required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">
            <span class="material-icons">tune</span>
          </div>
          <h3>Node Settings</h3>
          <p>Select any node on the graph to view and modify its execution parameters.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .properties-container { height: 100%; display: flex; flex-direction: column; background: var(--bg-secondary); }

    .panel-header {
      padding: 1.5rem;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid var(--accent);
    }

    .header-main { display: flex; align-items: center; gap: 1rem; }
    .type-icon { 
      width: 36px; height: 36px; 
      border-radius: 8px; 
      display: flex; align-items: center; justify-content: center;
      color: white;
    }
    .type-icon .material-icons { font-size: 1.2rem; }
    .header-text h3 { font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .node-id { font-size: 0.65rem; color: var(--text-secondary); font-family: monospace; }

    .delete-btn {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 8px; color: var(--text-secondary);
      transition: all 0.2s;
    }
    .delete-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .panel-content { 
      padding: 1.5rem; 
      flex: 1; 
      overflow-y: auto; 
      max-height: calc(100vh - 72px - 84px); /* Subtract header and node header heights */
    }

    .prop-section { margin-bottom: 2rem; }
    .section-title { 
      font-size: 0.7rem; font-weight: 800; 
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--text-secondary); margin-bottom: 1.25rem;
    }

    .field { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }

    input, select, textarea {
      width: 100%; padding: 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.85rem;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); outline: none; }

    .path-input { display: flex; align-items: center; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    .path-input .prefix { padding: 0 12px; font-size: 0.75rem; color: var(--text-secondary); background: var(--input-bg); border-right: 1px solid var(--border); }
    .path-input input { border: none; border-radius: 0; }

    .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }

    .help-text { font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.4; }

    .info-alert {
      display: flex; gap: 12px; padding: 1rem;
      background: var(--bg-primary); border: 1px solid var(--border); border-radius: 12px;
      color: var(--text-secondary);
    }
    .info-alert .material-icons { font-size: 1.1rem; color: var(--accent); }
    .info-alert p { font-size: 0.75rem; margin: 0; line-height: 1.4; }

    .empty-state {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 3rem; text-align: center; color: var(--text-secondary);
    }
    .empty-icon { width: 56px; height: 56px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; }
    .empty-icon .material-icons { font-size: 1.8rem; opacity: 0.4; }
    .empty-state h3 { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    .empty-state p { font-size: 0.8rem; line-height: 1.5; }
  `]
})
export class PropertiesPanelComponent {
  state = inject(WorkflowStateService);
  registry = inject(NodeRegistryService);
  modal = inject(ModalService);

  updateNode(node: any) {
    this.state.updateNodeData(node.id, node.data);
  }

  convertNode(node: any, newSubType: string) {
    const entry = this.registry.getEntry(newSubType);
    if (!entry) return;

    // Preserve some data if possible, but reset most
    node.type = entry.type;
    node.subType = entry.subType;
    node.label = entry.label;
    node.data = { ...entry.defaultData };
    
    this.state.updateNodeData(node.id, node.data);
    // Force state refresh for the whole node
    this.state.updateNodeStatus(node.id, 'idle'); 
  }

  async deleteNode(nodeId: string) {
    const confirmed = await this.modal.show({
      title: 'Delete Node',
      message: 'Are you sure you want to remove this node and all its connections? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Node',
      cancelText: 'Keep it'
    });

    if (confirmed) {
      this.state.removeNode(nodeId);
    }
  }
}
