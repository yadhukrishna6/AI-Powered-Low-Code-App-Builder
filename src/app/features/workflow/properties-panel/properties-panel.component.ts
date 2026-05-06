import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStateService } from '../services/workflow-state.service';
import { NODE_REGISTRY } from '../registry/node-registry';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="properties-container">
      <div *ngIf="state.selectedNode() as node; else emptyState">
        <div class="panel-header" [style.border-left-color]="getRegistry(node.subType).color">
          <div class="header-main">
            <span class="material-icons" [style.color]="getRegistry(node.subType).color">
              {{ getRegistry(node.subType).icon }}
            </span>
            <h3>{{ getRegistry(node.subType).label }}</h3>
          </div>
          <button class="delete-btn" (click)="deleteNode(node.id)">
            <span class="material-icons">delete_outline</span>
          </button>
        </div>

        <div class="panel-content">
          <!-- General Properties -->
          <div class="section">
            <label>Node Label</label>
            <input type="text" [(ngModel)]="node.label" (ngModelChange)="updateNode(node)">
          </div>

          <div class="divider"></div>

          <!-- Dynamic Properties based on type -->
          <div [ngSwitch]="node.subType" class="dynamic-fields">
            
            <!-- API Request -->
            <div *ngSwitchCase="'api-request'" class="field-group">
              <label>HTTP Method</label>
              <select [(ngModel)]="node.data.method" (ngModelChange)="updateNode(node)">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>

              <label>Endpoint URL</label>
              <input type="text" [(ngModel)]="node.data.url" placeholder="https://api.example.com/v1" (ngModelChange)="updateNode(node)">
              
              <label>Request Body (JSON)</label>
              <textarea [(ngModel)]="node.data.body" rows="4" (ngModelChange)="updateNode(node)"></textarea>
            </div>

            <!-- Approval -->
            <div *ngSwitchCase="'approval'" class="field-group">
              <label>Approver Role</label>
              <select [(ngModel)]="node.data.approverRole" (ngModelChange)="updateNode(node)">
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">Specific User</option>
              </select>

              <label>Timeout (Hours)</label>
              <input type="number" [(ngModel)]="node.data.timeout" (ngModelChange)="updateNode(node)">
            </div>

            <!-- Notification -->
            <div *ngSwitchCase="'send-notification'" class="field-group">
              <label>Channel</label>
              <select [(ngModel)]="node.data.channel" (ngModelChange)="updateNode(node)">
                <option value="email">Email</option>
                <option value="slack">Slack</option>
                <option value="push">Push Notification</option>
              </select>

              <label>Message Template</label>
              <textarea [(ngModel)]="node.data.message" rows="4" (ngModelChange)="updateNode(node)"></textarea>
            </div>

            <!-- Schedule -->
            <div *ngSwitchCase="'schedule'" class="field-group">
              <label>Cron Expression</label>
              <input type="text" [(ngModel)]="node.data.cron" (ngModelChange)="updateNode(node)">
              <p class="help-text">Standard cron format: * * * * *</p>
            </div>

            <!-- Fallback -->
            <div *ngSwitchDefault class="no-special-props">
              <p>No additional configuration required for this node.</p>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <span class="material-icons">info_outline</span>
          <p>Select a node to view properties</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .properties-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      padding: 1.25rem;
      border-bottom: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-primary);
    }
    .header-main { display: flex; align-items: center; gap: 0.75rem; }
    .header-main h3 { font-size: 0.95rem; font-weight: 700; margin: 0; }

    .delete-btn {
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
    }
    .delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .panel-content {
      padding: 1.25rem;
      flex: 1;
      overflow-y: auto;
    }

    .section { margin-bottom: 1.5rem; }
    .divider { height: 1px; background: var(--border); margin: 1.5rem 0; }

    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.6rem 0.75rem;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); outline: none; }

    .help-text { font-size: 0.7rem; color: var(--text-secondary); margin-top: -0.5rem; }

    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      padding: 2rem;
      text-align: center;
      gap: 1rem;
    }
    .empty-state .material-icons { font-size: 3rem; opacity: 0.2; }
  `]
})
export class PropertiesPanelComponent {
  state = inject(WorkflowStateService);

  getRegistry(subType: string) {
    return NODE_REGISTRY[subType];
  }

  updateNode(node: any) {
    this.state.updateNodeData(node.id, node.data);
  }

  deleteNode(nodeId: string) {
    if (confirm('Are you sure you want to delete this node?')) {
      this.state.removeNode(nodeId);
    }
  }
}
