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
            <div class="header-text">
              <h3>{{ getRegistry(node.subType).label }}</h3>
              <span class="node-id">{{ node.id }}</span>
            </div>
          </div>
          <button class="delete-btn" (click)="deleteNode(node.id)" title="Delete Node">
            <span class="material-icons">delete_outline</span>
          </button>
        </div>

        <div class="panel-content thin-scrollbar">
          <!-- General Properties -->
          <div class="section">
            <label>Display Name</label>
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
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <label>Endpoint URL</label>
              <input type="text" [(ngModel)]="node.data.url" placeholder="https://api.example.com/v1" (ngModelChange)="updateNode(node)">
              
              <label>Headers (JSON)</label>
              <textarea [(ngModel)]="node.data.headers" rows="3" placeholder='{ "Authorization": "Bearer..." }' (ngModelChange)="updateNode(node)"></textarea>

              <label *ngIf="node.data.method !== 'GET'">Request Body (JSON)</label>
              <textarea *ngIf="node.data.method !== 'GET'" [(ngModel)]="node.data.body" rows="5" (ngModelChange)="updateNode(node)"></textarea>
            </div>

            <!-- Condition -->
            <div *ngSwitchCase="'condition'" class="field-group">
              <div class="section-title">Logical Rules</div>
              <p class="help-text">Define conditions to branch your workflow.</p>
              
              <div class="condition-item">
                <label>Variable</label>
                <input type="text" [(ngModel)]="node.data.variable" placeholder="e.g. status" (ngModelChange)="updateNode(node)">
                
                <label>Operator</label>
                <select [(ngModel)]="node.data.operator" (ngModelChange)="updateNode(node)">
                  <option value="eq">Equals</option>
                  <option value="neq">Not Equals</option>
                  <option value="gt">Greater Than</option>
                  <option value="lt">Less Than</option>
                  <option value="contains">Contains</option>
                </select>

                <label>Value</label>
                <input type="text" [(ngModel)]="node.data.value" placeholder="e.g. approved" (ngModelChange)="updateNode(node)">
              </div>

              <div class="branch-info">
                <div class="branch"><span class="badge success">True</span> Follows first edge</div>
                <div class="branch"><span class="badge warning">False</span> Follows other edges</div>
              </div>
            </div>

            <!-- Delay -->
            <div *ngSwitchCase="'delay'" class="field-group">
              <label>Duration</label>
              <div class="input-row">
                <input type="number" [(ngModel)]="node.data.duration" (ngModelChange)="updateNode(node)">
                <select [(ngModel)]="node.data.unit" (ngModelChange)="updateNode(node)">
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>

            <!-- Approval -->
            <div *ngSwitchCase="'approval'" class="field-group">
              <label>Approver Role</label>
              <select [(ngModel)]="node.data.approverRole" (ngModelChange)="updateNode(node)">
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="billing">Billing Dept</option>
                <option value="security">Security Team</option>
              </select>

              <label>Escalation Timeout (Hours)</label>
              <input type="number" [(ngModel)]="node.data.timeout" (ngModelChange)="updateNode(node)">
              <p class="help-text">Time before auto-rejecting or escalating.</p>
            </div>

            <!-- Notification -->
            <div *ngSwitchCase="'send-notification'" class="field-group">
              <label>Channel</label>
              <select [(ngModel)]="node.data.channel" (ngModelChange)="updateNode(node)">
                <option value="email">📧 Email</option>
                <option value="slack">💬 Slack</option>
                <option value="push">🔔 Push Notification</option>
                <option value="sms">📱 SMS</option>
              </select>

              <label>Recipient (Variable or Email)</label>
              <input type="text" [(ngModel)]="node.data.recipient" placeholder="{{ '{{user.email}}' }}" (ngModelChange)="updateNode(node)">

              <label>Message Content</label>
              <textarea [(ngModel)]="node.data.message" rows="6" placeholder="Write your message here..." (ngModelChange)="updateNode(node)"></textarea>
            </div>

            <!-- Schedule -->
            <div *ngSwitchCase="'schedule'" class="field-group">
              <label>Cron Expression</label>
              <input type="text" [(ngModel)]="node.data.cron" placeholder="0 0 * * *" (ngModelChange)="updateNode(node)">
              <div class="cron-helper">
                <span>Next Run: Today at 12:00 PM</span>
              </div>
            </div>

            <!-- Fallback -->
            <div *ngSwitchDefault class="no-special-props">
              <div class="info-card">
                <span class="material-icons">info</span>
                <p>No additional configuration required for this node type.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-state">
          <div class="empty-icon">
            <span class="material-icons">settings_input_component</span>
          </div>
          <h3>Properties</h3>
          <p>Select a node on the canvas to configure its properties and logic.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .properties-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--bg-secondary);
    }

    .panel-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      border-left: 4px solid var(--accent);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-primary);
    }
    .header-main { display: flex; align-items: center; gap: 1rem; }
    .header-text h3 { font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .node-id { font-size: 0.65rem; color: var(--text-secondary); font-family: monospace; opacity: 0.7; }

    .delete-btn {
      color: var(--text-secondary);
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .panel-content {
      padding: 1.5rem;
      flex: 1;
      overflow-y: auto;
    }

    .section { margin-bottom: 1.5rem; }
    .section-title { font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-primary); margin-bottom: 1rem; }
    .divider { height: 1px; background: var(--border); margin: 2rem 0; }

    label {
      display: block;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
    }

    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
      transition: all 0.2s;
    }
    input:focus, select:focus, textarea:focus { 
      border-color: var(--accent); 
      outline: none;
      box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.1);
    }

    .input-row { display: flex; gap: 0.5rem; }
    .input-row input { flex: 2; }
    .input-row select { flex: 3; }

    .help-text { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; }
    
    .condition-item {
      background: var(--bg-primary);
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid var(--border);
      margin-bottom: 1rem;
    }

    .branch-info {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .branch { font-size: 0.75rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.5rem; }
    .badge { padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; }
    .badge.success { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .badge.warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

    .info-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-primary);
      border-radius: 12px;
      border: 1px solid var(--border);
      color: var(--text-secondary);
    }
    .info-card .material-icons { font-size: 1.25rem; color: var(--accent); }
    .info-card p { font-size: 0.8rem; margin: 0; line-height: 1.4; }

    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      padding: 3rem;
      text-align: center;
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      background: var(--bg-primary);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      border: 1px solid var(--border);
    }
    .empty-icon .material-icons { font-size: 2rem; opacity: 0.4; }
    .empty-state h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary); }
    .empty-state p { font-size: 0.85rem; line-height: 1.5; }
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
