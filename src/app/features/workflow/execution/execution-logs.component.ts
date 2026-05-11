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
        <div class="timeline-item" *ngFor="let step of context()?.history; let last = last">
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
        <div class="timeline-item waiting" *ngIf="hasWaitingNode()">
          <div class="item-marker warning pulse">
            <span class="material-icons">pause_circle</span>
          </div>
          <div class="item-content">
            <div class="item-card waiting">
              <div class="item-header">
                <span class="node-label">Awaiting User Action</span>
              </div>
              <p class="waiting-msg">Execution is paused. Please approve or reject this step to continue.</p>
              <div class="item-actions">
                <button class="btn-approve" (click)="resume('approve')">
                  <span class="material-icons">check</span> Approve
                </button>
                <button class="btn-reject" (click)="resume('reject')">
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
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 1.25rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      color: #374151;
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
    }

    .header-info h3 { font-size: 0.85rem; font-weight: 800; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    .instance-id { font-size: 0.6rem; color: #6b7280; font-family: 'Fira Code', monospace; margin: 4px 0 0; opacity: 0.8; word-break: break-all; }
    
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
      border-radius: 6px; color: #6b7280;
      transition: all 0.2s; background: #f3f4f6;
    }
    .close-btn:hover { background: #e5e7eb; color: #111827; }
    .close-btn .material-icons { font-size: 1rem; }

    /* Progress */
    .progress-container { margin-bottom: 1.25rem; }
    .progress-bar { height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
    .progress-fill { height: 100%; background: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.3); transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .progress-text { font-size: 0.6rem; font-weight: 700; color: #6b7280; }

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
      width: 2px; background: #f3f4f6;
    }

    .item-marker {
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      background: #fff; border: 2px solid #e5e7eb;
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
      background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 12px; padding: 0.85rem; position: relative; overflow: hidden;
    }
    .item-card.success { border-left: 4px solid #22c55e; }
    .item-card.error { border-left: 4px solid #ef4444; }
    .item-card.running { border-left: 4px solid #3b82f6; }
    .item-card.waiting { border-left: 4px solid #f59e0b; }

    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; gap: 0.5rem; flex-wrap: wrap; }
    .node-label { font-size: 0.75rem; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
    .status-text { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
    .status-text.success { background: #f0fdf4; color: #166534; }
    .status-text.error { background: #fef2f2; color: #991b1b; }
    .timestamp { font-size: 0.6rem; color: #9ca3af; font-family: monospace; }
    
    .item-message { font-size: 0.7rem; color: #4b5563; line-height: 1.4; margin-bottom: 0.5rem; word-break: break-word; }
    
    .item-metrics { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
    .metric { display: flex; align-items: center; gap: 4px; font-size: 0.6rem; color: #6b7280; font-weight: 600; }
    .metric .material-icons { font-size: 0.8rem; opacity: 0.6; }

    .item-details { margin-top: 0.5rem; border-top: 1px solid #f3f4f6; padding-top: 0.5rem; }
    .item-details summary { font-size: 0.65rem; font-weight: 700; color: #3b82f6; cursor: pointer; outline: none; list-style: none; display: flex; align-items: center; gap: 4px; }
    .item-details summary::before { content: '▶'; font-size: 0.5rem; transition: transform 0.2s; color: #3b82f6; }
    .item-details[open] summary::before { transform: rotate(90deg); }
    
    .item-details pre { 
      background: #111827; padding: 0.75rem; border-radius: 8px; 
      font-size: 0.65rem; color: #10b981; margin-top: 0.5rem;
      max-height: 200px; overflow: auto; border: 1px solid #1f2937;
      font-family: 'Fira Code', monospace; line-height: 1.4; word-break: break-all; white-space: pre-wrap;
    }

    .loader-line { height: 2px; width: 100%; background: #f3f4f6; position: absolute; bottom: 0; left: 0; overflow: hidden; }
    .loader-line::after {
      content: ''; position: absolute; left: -50%; width: 50%; height: 100%;
      background: #3b82f6; animation: loader-slide 1.5s infinite linear;
    }

    .waiting-msg { font-size: 0.7rem; color: #4b5563; margin-bottom: 1rem; line-height: 1.4; }
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
    .completion-card p { font-size: 0.7rem; color: #15803d; margin-bottom: 1rem; }
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
  
  context = computed(() => this.runtime.activeExecutionContext());

  getNodeLabel(nodeId: string): string {
    const node = this.state.nodes().find(n => n.id === nodeId);
    return node?.label || nodeId;
  }

  calculateProgress(): number {
    const ctx = this.context();
    if (!ctx) return 0;
    
    const totalNodes = this.state.nodes().length;
    if (totalNodes === 0) return 0;
    
    const completedNodes = ctx.history.length;
    return Math.min(Math.round((completedNodes / totalNodes) * 100), 100);
  }

  hasWaitingNode() {
    return this.state.nodes().some(n => n.status === 'waiting');
  }

  resume(action: 'approve' | 'reject') {
    // Find the waiting node
    const waitingNode = this.state.nodes().find(n => n.status === 'waiting');
    if (waitingNode) {
      this.runtime.resumeWorkflow(waitingNode.id, action);
    }
  }

  closeLogs() {
    this.runtime.activeExecutionContext.set(null);
    this.state.resetExecutionStates();
  }
}
