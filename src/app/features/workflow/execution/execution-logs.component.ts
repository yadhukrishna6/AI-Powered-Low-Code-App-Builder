import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowRuntimeService } from './workflow-runtime.service';

@Component({
  selector: 'app-execution-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logs-container">
      <div class="logs-header">
        <h3>Execution Timeline</h3>
        <span class="status-badge" [class]="context()?.status">
          {{ context()?.status | uppercase }}
        </span>
      </div>

      <div class="timeline">
        <div class="timeline-item" *ngFor="let step of context()?.history">
          <div class="item-marker" [class.success]="step.success" [class.error]="!step.success">
            <span class="material-icons">{{ step.success ? 'check_circle' : 'error' }}</span>
          </div>
          <div class="item-content">
            <div class="item-card" [class.success]="step.success" [class.error]="!step.success">
              <div class="item-header">
                <span class="node-id">{{ step.nodeId }}</span>
                <span class="status-text" [class.success]="step.success" [class.error]="!step.success">
                  {{ step.success ? 'Success' : 'Failed' }}
                </span>
                <span class="timestamp">{{ step.timestamp | date:'shortTime' }}</span>
              </div>
              <div class="item-message" *ngIf="step.message">{{ step.message }}</div>
              <div class="item-details" *ngIf="step.input || step.output || step.error">
                <div class="detail-section" *ngIf="step.input">
                  <strong>Input:</strong> {{ step.input | json }}
                </div>
                <div class="detail-section" *ngIf="step.output">
                  <strong>Output:</strong> {{ step.output | json }}
                </div>
                <div class="detail-section error" *ngIf="step.error">
                  <strong>Failure Reason:</strong> {{ step.error }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Running Indicator -->
        <div class="timeline-item active" *ngIf="context()?.status === 'active'">
          <div class="item-marker pulse">
            <span class="material-icons">sync</span>
          </div>
          <div class="item-content">
            <div class="item-card running">
              <div class="item-header">
                <span class="node-id">Processing...</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Waiting Indicator -->
        <div class="timeline-item waiting" *ngIf="context()?.status === 'active' && hasWaitingNode()">
          <div class="item-marker warning">
            <span class="material-icons">pause_circle</span>
          </div>
          <div class="item-content">
            <div class="item-card waiting">
              <div class="item-header">
                <span class="node-id">Awaiting Approval</span>
              </div>
              <div class="item-actions">
                <button class="btn-approve" (click)="resume('approve')">Approve</button>
                <button class="btn-reject" (click)="resume('reject')">Reject</button>
              </div>
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
      padding: 1.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .logs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .logs-header h3 { font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0; }
    
    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 800;
    }
    .status-badge.active { background: rgba(var(--accent-rgb), 0.1); color: var(--accent); }
    .status-badge.completed { background: rgba(34, 197, 94, 0.1); color: #22c55e; }

    .timeline {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding-left: 0.5rem;
    }

    .timeline-item {
      display: flex;
      gap: 1rem;
      position: relative;
    }

    .timeline-item:not(:last-child)::after {
      content: '';
      position: absolute;
      left: 11px;
      top: 24px;
      bottom: -24px;
      width: 2px;
      background: var(--border);
    }

    .item-marker {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      border-radius: 50%;
      z-index: 1;
    }

    .item-marker .material-icons { font-size: 1.1rem; }
    .item-marker.success { color: #22c55e; }
    .item-marker.error { color: #ef4444; }
    .item-marker.pulse { color: var(--accent); animation: pulse 2s infinite; }
    .item-marker.warning { color: #f59e0b; }

    @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    .item-content { flex: 1; }
    .item-card {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
    }
    .item-card.success { border-color: #22c55e; background: rgba(34, 197, 94, 0.05); }
    .item-card.error { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
    .item-card.running { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.05); }
    .item-card.waiting { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }

    .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .node-id { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
    .status-text { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .status-text.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    .status-text.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    .timestamp { font-size: 0.7rem; color: var(--text-secondary); }
    .item-message { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.5rem; }

    .item-details { margin-top: 0.5rem; }
    .detail-section { font-size: 0.7rem; margin-bottom: 0.25rem; }
    .detail-section strong { color: var(--text-primary); }
    .detail-section.error { color: #ef4444; }
    .detail-section.error strong { color: #ef4444; }

    .item-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .btn-approve {
      background: #22c55e; color: white; padding: 0.4rem 0.8rem;
      border-radius: 8px; font-size: 0.75rem; font-weight: 700;
    }
    .btn-reject {
      background: #ef4444; color: white; padding: 0.4rem 0.8rem;
      border-radius: 8px; font-size: 0.75rem; font-weight: 700;
    }
  `]
})
export class ExecutionLogsComponent {
  runtime = inject(WorkflowRuntimeService);
  context = computed(() => this.runtime.activeExecutionContext());

  hasWaitingNode() {
    // In a real app, check if any node in the active workflow has status 'waiting'
    return true; // For demo purposes
  }

  resume(action: 'approve' | 'reject') {
    this.runtime.resumeWorkflow('current', action);
  }
}
