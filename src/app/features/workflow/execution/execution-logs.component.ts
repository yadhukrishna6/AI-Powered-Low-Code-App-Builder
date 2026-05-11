import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowRuntimeService } from './workflow-runtime.service';
import { WorkflowStateService } from '../services/workflow-state.service';

@Component({
  selector: 'app-execution-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logs-container">
      <div class="logs-header">
        <div class="header-info">
          <h3>Execution Timeline</h3>
          <p class="instance-id">{{ context()?.instanceId }}</p>
        </div>
        <div class="header-actions">
          <span class="status-badge" [class]="context()?.status">
            {{ context()?.status | uppercase }}
          </span>
          <button class="close-btn" (click)="closeLogs()" title="Dismiss Logs">
            <span class="material-icons">close</span>
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container" *ngIf="context()?.status === 'active' || context()?.status === 'running'">
        <div class="progress-bar">
          <div class="progress-fill pulse" [style.width.%]="calculateProgress()"></div>
        </div>
        <span class="progress-text">{{ calculateProgress() }}% Complete</span>
      </div>

      <div class="timeline thin-scrollbar">
        <div class="timeline-item" *ngFor="let step of context()?.history; trackBy: trackByLogId">
          <div class="item-marker" [class.success]="step.success" [class.error]="!step.success">
            <span class="material-icons">{{ step.success ? 'check_circle' : 'error' }}</span>
          </div>
          <div class="item-content">
            <div class="item-card" [class.success]="step.success" [class.error]="!step.success">
              <div class="item-header">
                <span class="node-label">{{ getNodeLabel(step.nodeId) }}</span>
                <span class="status-text" [class.success]="step.success" [class.error]="!step.success">
                  {{ step.success ? 'Success' : 'Failed' }}
                </span>
                <span class="timestamp">{{ step.timestamp | date:'HH:mm:ss' }}</span>
              </div>
              <div class="item-message" *ngIf="step.message">{{ step.message }}</div>
              
              <div class="item-metrics" *ngIf="step.duration">
                <span class="metric"><span class="material-icons">timer</span> {{ step.duration }}ms</span>
              </div>

              <div class="item-details" *ngIf="step.input || step.output || step.error">
                <details>
                  <summary>View Data</summary>
                  <div class="detail-section" *ngIf="step.input">
                    <strong>Input:</strong> <pre>{{ step.input | json }}</pre>
                  </div>
                  <div class="detail-section" *ngIf="step.output">
                    <strong>Output:</strong> <pre>{{ step.output | json }}</pre>
                  </div>
                  <div class="detail-section error" *ngIf="step.error">
                    <strong>Failure Reason:</strong> {{ step.error }}
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Running Indicator -->
        <div class="timeline-item active" *ngIf="(context()?.status === 'active' || context()?.status === 'running') && !hasWaitingNode()">
          <div class="item-marker pulse">
            <span class="material-icons">sync</span>
          </div>
          <div class="item-content">
            <div class="item-card running">
              <div class="item-header">
                <span class="node-label">Processing...</span>
              </div>
              <div class="loader-line"></div>
            </div>
          </div>
        </div>
        
        <!-- Waiting Indicator -->
        <div class="timeline-item waiting" *ngFor="let node of waitingNodes()">
          <div class="item-marker warning pulse">
            <span class="material-icons">pause_circle</span>
          </div>
          <div class="item-content">
            <div class="item-card waiting">
              <div class="item-header">
                <span class="node-label">{{ node.label }}</span>
                <span class="status-text">Awaiting Action</span>
              </div>
              <p class="waiting-msg">This step requires manual approval to proceed.</p>
              <div class="item-actions">
                <button class="btn-approve" (click)="resume(node.id, 'approve')" [disabled]="isProcessing">
                  <span class="material-icons">{{ isProcessing ? 'sync' : 'check' }}</span> 
                  {{ isProcessing ? 'Processing...' : 'Approve' }}
                </button>
                <button class="btn-reject" (click)="resume(node.id, 'reject')" [disabled]="isProcessing">
                  <span class="material-icons">close</span> Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Completion Indicator -->
        <div class="timeline-item completion" *ngIf="context()?.status === 'completed' || context()?.status === 'success'">
          <div class="item-marker success">
            <span class="material-icons">verified</span>
          </div>
          <div class="item-content">
            <div class="completion-card">
              <h4>Workflow Finished</h4>
              <p>All nodes processed successfully.</p>
              <button class="btn-primary" (click)="closeLogs()">Return to Builder</button>
            </div>
          </div>
        </div>

        <!-- Failure Indicator -->
        <div class="timeline-item completion" *ngIf="context()?.status === 'failed'">
          <div class="item-marker error">
            <span class="material-icons">report_off</span>
          </div>
          <div class="item-content">
            <div class="completion-card failed">
              <h4>Execution Failed</h4>
              <p>Workflow stopped due to an error.</p>
              <button class="btn-primary" (click)="closeLogs()">Return to Builder</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logs-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: var(--card-shadow);
      color: var(--text-primary);
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .header-info h3 { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    .instance-id { font-size: 0.6rem; color: var(--text-secondary); font-family: 'Fira Code', monospace; margin: 4px 0 0; opacity: 0.8; word-break: break-all; }
    
    .header-actions { display: flex; align-items: center; gap: 0.5rem; }
    
    .status-badge {
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.6rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .status-badge.active, .status-badge.running { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
    .status-badge.completed, .status-badge.success { background: #f0fdf4; color: #22c55e; border: 1px solid #dcfce7; }
    .status-badge.failed { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; }

    .close-btn {
      width: 26px; height: 26px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; color: var(--text-secondary);
      transition: all 0.2s; background: var(--input-bg);
    }
    .close-btn:hover { background: var(--border); color: var(--text-primary); }
    .close-btn .material-icons { font-size: 1rem; }

    /* Progress */
    .progress-container { margin-bottom: 1.25rem; }
    .progress-bar { height: 6px; background: var(--input-bg); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
    .progress-fill { height: 100%; background: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.3); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .progress-text { font-size: 0.6rem; font-weight: 700; color: var(--text-secondary); }

    .timeline {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding-right: 0.5rem;
    }

    .timeline-item { display: flex; gap: 1rem; position: relative; }

    .timeline-item:not(:last-child)::after {
      content: ''; position: absolute; left: 11px; top: 24px; bottom: -24px;
      width: 2px; background: var(--border);
    }

    .item-marker {
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-secondary); border: 2px solid var(--border);
      border-radius: 50%; z-index: 1; flex-shrink: 0;
    }

    .item-marker .material-icons { font-size: 0.9rem; }
    .item-marker.success { color: #22c55e; border-color: #dcfce7; }
    .item-marker.error { color: #ef4444; border-color: #fee2e2; }
    .item-marker.pulse { border-color: #3b82f6; color: #3b82f6; animation: marker-pulse-light 2s infinite; }
    .item-marker.warning { color: #f59e0b; border-color: #fef3c7; }

    @keyframes marker-pulse-light { 0% { box-shadow: 0 0 0 0 rgba(59,130,246, 0.2); } 70% { box-shadow: 0 0 0 8px rgba(59,130,246, 0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246, 0); } }

    .item-content { flex: 1; min-width: 0; }
    .item-card {
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 12px; padding: 0.85rem; position: relative; overflow: hidden;
    }
    .item-card.success { border-left: 4px solid #22c55e; }
    .item-card.error { border-left: 4px solid #ef4444; }
    .item-card.running { border-left: 4px solid #3b82f6; }
    .item-card.waiting { border-left: 4px solid #f59e0b; }

    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap; }
    .node-label { font-size: 0.75rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
    .status-text { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
    .status-text.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .status-text.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .timestamp { font-size: 0.6rem; color: var(--text-secondary); font-family: monospace; }
    
    .item-message { font-size: 0.7rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.5rem; word-break: break-word; }
    
    .item-metrics { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
    .metric { display: flex; align-items: center; gap: 4px; font-size: 0.6rem; color: var(--text-secondary); font-weight: 600; }
    .metric .material-icons { font-size: 0.8rem; opacity: 0.6; }

    .item-details { margin-top: 0.5rem; border-top: 1px solid var(--border); padding-top: 0.5rem; }
    .item-details summary { font-size: 0.65rem; font-weight: 700; color: #3b82f6; cursor: pointer; outline: none; list-style: none; display: flex; align-items: center; gap: 4px; }
    .item-details summary::before { content: '▶'; font-size: 0.5rem; transition: transform 0.2s; color: #3b82f6; }
    .item-details[open] summary::before { transform: rotate(90deg); }
    
    .item-details pre { 
      background: #111827; padding: 0.75rem; border-radius: 8px; 
      font-size: 0.65rem; color: #10b981; margin-top: 0.5rem;
      max-height: 200px; overflow: auto; border: 1px solid #1f2937;
      font-family: 'Fira Code', monospace; line-height: 1.4; word-break: break-all; white-space: pre-wrap;
    }

    .loader-line { height: 2px; width: 100%; background: var(--border); position: absolute; bottom: 0; left: 0; overflow: hidden; }
    .loader-line::after {
      content: ''; position: absolute; left: -50%; width: 50%; height: 100%;
      background: #3b82f6; animation: loader-slide 1.5s infinite linear;
    }

    .waiting-msg { font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4; }
    .item-actions { display: flex; flex-direction: column; gap: 0.5rem; width: 100%; }
    .btn-approve, .btn-reject {
      display: flex; align-items: center; justify-content: center; gap: 6px; padding: 0.6rem;
      border-radius: 8px; font-size: 0.7rem; font-weight: 700; transition: all 0.2s; width: 100%;
      border: 1px solid rgba(0,0,0,0.05);
    }
    .btn-approve { background: #22c55e; color: #fff; }
    .btn-approve:hover { background: #16a34a; transform: translateY(-1px); }
    .btn-reject { background: #ef4444; color: #fff; }
    .btn-reject:hover { background: #dc2626; transform: translateY(-1px); }

    .completion-card {
      background: #f0fdf4; border: 1px solid #dcfce7;
      border-radius: 12px; padding: 1.25rem; text-align: center;
    }
    .completion-card h4 { font-size: 0.85rem; font-weight: 800; margin: 0 0 0.5rem; color: #166534; }
    .completion-card p { font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 1rem; }
    .completion-card.failed { background: #fef2f2; border-color: #fee2e2; }
    .completion-card.failed h4 { color: #991b1b; }
    .completion-card.failed p { color: #b91c1c; }

    .btn-primary {
      background: #3b82f6; color: white; padding: 0.6rem;
      border-radius: 8px; font-size: 0.7rem; font-weight: 700; width: 100%;
      box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
    }
  `]


})
export class ExecutionLogsComponent {
  runtime = inject(WorkflowRuntimeService);
  state = inject(WorkflowStateService);

  context = this.runtime.activeExecutionContext;
  isProcessing = false;

  calculateProgress(): number {
    const ctx = this.context();
    if (!ctx) return 0;
    const total = this.state.nodes().length;
    const completed = ctx.history.length;
    return Math.min(Math.round((completed / total) * 100), 99);
  }

  getNodeLabel(nodeId: string): string {
    const node = this.state.nodes().find(n => n.id === nodeId);
    return node?.label || nodeId;
  }

  hasWaitingNode(): boolean {
    return this.state.nodes().some(n => n.status === 'waiting');
  }

  waitingNodes() {
    return this.state.nodes().filter(n => n.status === 'waiting');
  }

  trackByLogId(index: number, item: any) {
    return item.id || index;
  }

  async resume(nodeId: string, action: 'approve' | 'reject') {
    if (this.isProcessing) return;
    this.isProcessing = true;
    try {
      await this.runtime.resumeWorkflow(nodeId, action);
    } finally {
      // Keep loading state for a moment to allow polling to catch up
      setTimeout(() => this.isProcessing = false, 2000);
    }
  }

  closeLogs() {
    this.runtime.clearExecution();
  }
}
