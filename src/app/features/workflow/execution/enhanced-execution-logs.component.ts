// src/app/features/workflow/execution/enhanced-execution-logs.component.ts

import { Component, inject, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowRuntimeService } from './workflow-runtime.service';
import { RuntimeStateService } from '../services/runtime-state.service';
import { RuntimeVisualizationConfig } from '../models/runtime.model';

@Component({
  selector: 'app-enhanced-execution-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="execution-panel">
      <!-- Execution Progress Header -->
      <div class="execution-header" *ngIf="executionSnapshot()">
        <div class="execution-status">
          <div class="status-indicator" [class]="executionSnapshot()?.status">
            <span class="material-icons">{{ getStatusIcon(executionSnapshot()?.status) }}</span>
          </div>
          <div class="status-info">
            <h3>Workflow Execution</h3>
            <p class="execution-id">{{ executionSnapshot()?.executionId }}</p>
          </div>
        </div>

        <div class="execution-progress">
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="executionSnapshot()?.progress"></div>
          </div>
          <span class="progress-text">{{ executionSnapshot()?.progress }}% Complete</span>
        </div>

        <div class="execution-controls" *ngIf="isExecuting()">
          <button class="btn-pause" (click)="pauseExecution()" title="Pause Execution">
            <span class="material-icons">pause</span>
          </button>
          <button class="btn-stop" (click)="stopExecution()" title="Stop Execution">
            <span class="material-icons">stop</span>
          </button>
        </div>
      </div>

      <!-- Real-time Execution Timeline -->
      <div class="execution-timeline" *ngIf="executionSnapshot()">
        <div class="timeline-header">
          <h4>Execution Timeline</h4>
          <div class="timeline-controls">
            <button class="btn-replay" (click)="toggleReplay()" [class.active]="isReplaying()">
              <span class="material-icons">replay</span>
              Replay
            </button>
            <button class="btn-settings" (click)="toggleSettings()">
              <span class="material-icons">settings</span>
            </button>
          </div>
        </div>

        <div class="timeline-container" thin-scrollbar>
          <div class="timeline-item"
               *ngFor="let nodeState of executionSnapshot()?.nodeStates; trackBy: trackByNodeId"
               [class]="getTimelineItemClass(nodeState)">

            <!-- Timeline Marker -->
            <div class="timeline-marker" [class]="nodeState.state">
              <span class="material-icons">{{ getNodeStateIcon(nodeState.state) }}</span>
              <div class="marker-pulse" *ngIf="nodeState.state === 'running'"></div>
            </div>

            <!-- Timeline Content -->
            <div class="timeline-content" [class]="nodeState.state">
              <div class="content-header">
                <div class="node-info">
                  <span class="node-id">{{ nodeState.nodeId }}</span>
                  <span class="node-type">{{ getNodeTypeLabel(nodeState.nodeId) }}</span>
                </div>
                <div class="execution-times">
                  <span class="start-time" *ngIf="nodeState.startedAt">
                    {{ nodeState.startedAt | date:'shortTime' }}
                  </span>
                  <span class="duration" *ngIf="nodeState.duration">
                    {{ formatDuration(nodeState.duration) }}
                  </span>
                </div>
              </div>

              <!-- Branch Information -->
              <div class="branch-info" *ngIf="nodeState.branchTaken">
                <span class="branch-label" [class]="nodeState.branchTaken">
                  {{ nodeState.branchTaken | uppercase }} path taken
                </span>
              </div>

              <!-- Error Display -->
              <div class="execution-error" *ngIf="nodeState.error">
                <div class="error-header">
                  <span class="material-icons">error</span>
                  <span class="error-title">Execution Failed</span>
                </div>
                <div class="error-message">{{ nodeState.error }}</div>
                <div class="error-details" *ngIf="nodeState.output">
                  <details>
                    <summary>Error Details</summary>
                    <pre>{{ nodeState.output | json }}</pre>
                  </details>
                </div>
              </div>

              <!-- Output Display -->
              <div class="execution-output" *ngIf="nodeState.output && !nodeState.error">
                <details>
                  <summary>Output Data</summary>
                  <pre>{{ nodeState.output | json }}</pre>
                </details>
              </div>

              <!-- Waiting Actions -->
              <div class="waiting-actions" *ngIf="nodeState.state === 'waiting'">
                <button class="btn-approve" (click)="resumeExecution('approve')">
                  <span class="material-icons">check_circle</span>
                  Approve
                </button>
                <button class="btn-reject" (click)="resumeExecution('reject')">
                  <span class="material-icons">cancel</span>
                  Reject
                </button>
              </div>
            </div>
          </div>

          <!-- Current Running Indicator -->
          <div class="timeline-item running" *ngIf="isExecuting() && !currentNodeId()">
            <div class="timeline-marker running">
              <span class="material-icons">sync</span>
              <div class="marker-pulse"></div>
            </div>
            <div class="timeline-content running">
              <div class="content-header">
                <span class="node-id">Initializing execution...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Execution Statistics -->
      <div class="execution-stats" *ngIf="executionSnapshot()">
        <div class="stat-item">
          <span class="stat-label">Total Nodes</span>
          <span class="stat-value">{{ executionSnapshot()?.nodeStates.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Completed</span>
          <span class="stat-value">{{ getCompletedCount() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Failed</span>
          <span class="stat-value failed">{{ getFailedCount() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Duration</span>
          <span class="stat-value">{{ getTotalDuration() }}</span>
        </div>
      </div>

      <!-- Visualization Settings Panel -->
      <div class="settings-panel" *ngIf="showSettings()">
        <h4>Visualization Settings</h4>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox"
                   [(ngModel)]="config().animations.enabled"
                   (ngModelChange)="updateConfig()">
            Enable Animations
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox"
                   [(ngModel)]="config().styles.nodeGlow"
                   (ngModelChange)="updateConfig()">
            Node Glow Effects
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox"
                   [(ngModel)]="config().styles.edgeAnimation"
                   (ngModelChange)="updateConfig()">
            Edge Flow Animation
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox"
                   [(ngModel)]="config().styles.pulseEffects"
                   (ngModelChange)="updateConfig()">
            Pulse Effects
          </label>
        </div>

        <div class="setting-group">
          <label class="setting-toggle">
            <input type="checkbox"
                   [(ngModel)]="config().styles.statusBadges"
                   (ngModelChange)="updateConfig()">
            Status Badges
          </label>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .execution-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .execution-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
    }

    .execution-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-indicator {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .status-indicator.running { background: #3b82f6; color: white; }
    .status-indicator.success { background: #10b981; color: white; }
    .status-indicator.failed { background: #ef4444; color: white; }
    .status-indicator.idle { background: #64748b; color: white; }

    .status-info h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .execution-id {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-family: monospace;
    }

    .execution-progress {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-bar {
      width: 200px;
      height: 8px;
      background: var(--bg-primary);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .execution-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-pause, .btn-stop {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-pause:hover { background: #fef3c7; color: #f59e0b; }
    .btn-stop:hover { background: #fee2e2; color: #ef4444; }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .timeline-header h4 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .timeline-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-replay, .btn-settings {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s ease;
    }

    .btn-replay:hover { background: var(--accent); color: white; }
    .btn-settings:hover { background: var(--bg-primary); border-color: var(--accent); }

    .btn-replay.active {
      background: var(--accent);
      color: white;
    }

    .timeline-container {
      max-height: 400px;
      overflow-y: auto;
      padding-right: 0.5rem;
    }

    .timeline-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      position: relative;
    }

    .timeline-item:last-child {
      margin-bottom: 0;
    }

    .timeline-marker {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      margin-top: 6px;
      flex-shrink: 0;
      position: relative;
      font-size: 12px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .timeline-marker.running { background: #3b82f6; color: white; }
    .timeline-marker.success { background: #10b981; color: white; }
    .timeline-marker.failed { background: #ef4444; color: white; }
    .timeline-marker.idle { background: #64748b; color: white; }
    .timeline-marker.queued { background: #f59e0b; color: white; }
    .timeline-marker.waiting { background: #f59e0b; color: white; }
    .timeline-marker.skipped { background: #9ca3af; color: white; }
    .timeline-marker.cancelled { background: #6b7280; color: white; }

    .marker-pulse {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border: 2px solid currentColor;
      border-radius: 50%;
      animation: marker-pulse 1.5s infinite;
      opacity: 0.6;
    }

    @keyframes marker-pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.3);
        opacity: 0;
      }
    }

    .timeline-content {
      flex: 1;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 0.75rem;
      margin-left: 1rem;
    }

    .timeline-content.running {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.05);
    }

    .timeline-content.success {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.05);
    }

    .timeline-content.failed {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.05);
    }

    .timeline-content.waiting {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.05);
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .node-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .node-id {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: monospace;
    }

    .node-type {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .execution-times {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .branch-info {
      margin: 0.5rem 0;
    }

    .branch-label {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .branch-label.true {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .branch-label.false {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .execution-error {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      padding: 0.75rem;
      margin: 0.5rem 0;
    }

    .error-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .error-header .material-icons {
      color: #ef4444;
      font-size: 1rem;
    }

    .error-title {
      font-weight: 600;
      color: #ef4444;
      font-size: 0.8rem;
    }

    .error-message {
      color: var(--text-primary);
      font-size: 0.8rem;
      line-height: 1.4;
      margin-bottom: 0.5rem;
    }

    .execution-output {
      margin: 0.5rem 0;
    }

    .execution-output details {
      background: rgba(16, 185, 129, 0.05);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 8px;
      padding: 0.5rem;
    }

    .execution-output summary {
      color: #10b981;
      font-weight: 600;
      cursor: pointer;
    }

    .execution-output pre {
      background: var(--bg-primary);
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      overflow-x: auto;
      margin-top: 0.5rem;
    }

    .waiting-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .btn-approve, .btn-reject {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.25rem;
      transition: all 0.2s ease;
    }

    .btn-approve {
      background: #10b981;
      color: white;
    }

    .btn-approve:hover {
      background: #059669;
    }

    .btn-reject {
      background: #ef4444;
      color: white;
    }

    .btn-reject:hover {
      background: #dc2626;
    }

    .execution-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      padding: 1rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
    }

    .stat-item {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .stat-value.failed {
      color: #ef4444;
    }

    .settings-panel {
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
    }

    .settings-panel h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .setting-group {
      margin-bottom: 1rem;
    }

    .setting-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-primary);
      cursor: pointer;
    }

    .setting-toggle input {
      width: 16px;
      height: 16px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .execution-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .execution-progress {
        width: 100%;
      }

      .progress-bar {
        width: 100%;
      }

      .timeline-controls {
        flex-direction: column;
        gap: 0.25rem;
      }

      .execution-stats {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
      }

      .waiting-actions {
        flex-direction: column;
      }
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .timeline-marker {
        border-color: #374151;
      }
    }

    /* Reduced Motion Support */
    @media (prefers-reduced-motion: reduce) {
      .marker-pulse,
      .progress-fill {
        animation: none !important;
      }
    }
  `]
})
export class EnhancedExecutionLogsComponent {
  runtime = inject(WorkflowRuntimeService);
  runtimeState = inject(RuntimeStateService);

  executionSnapshot = computed(() => this.runtimeState.executionSnapshot());
  isExecuting = computed(() => this.runtimeState.isExecuting());
  currentNodeId = computed(() => this.runtimeState.currentNodeId());
  config = computed(() => this.runtimeState.config());

  showSettings = signal(false);
  isReplaying = signal(false);

  constructor() {
    // Auto-scroll to latest execution item
    effect(() => {
      const snapshot = this.executionSnapshot();
      if (snapshot && this.isExecuting()) {
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  trackByNodeId(index: number, item: any): string {
    return item.nodeId;
  }

  getStatusIcon(status?: string): string {
    const icons: Record<string, string> = {
      'running': 'sync',
      'success': 'check_circle',
      'failed': 'error',
      'idle': 'schedule',
      'completed': 'check_circle',
      'cancelled': 'cancel'
    };
    return icons[status || 'idle'] || 'help';
  }

  getNodeStateIcon(state: string): string {
    const icons: Record<string, string> = {
      'running': 'sync',
      'success': 'check_circle',
      'failed': 'error',
      'idle': 'radio_button_unchecked',
      'queued': 'schedule',
      'waiting': 'pause_circle',
      'skipped': 'skip_next',
      'cancelled': 'cancel'
    };
    return icons[state] || 'help';
  }

  getNodeTypeLabel(nodeId: string): string {
    // This would be enhanced to get actual node type from workflow state
    return 'Node';
  }

  getTimelineItemClass(nodeState: any): string {
    return `timeline-item ${nodeState.state}`;
  }

  formatDuration(duration: number): string {
    if (duration < 1000) return `${duration}ms`;
    const seconds = Math.floor(duration / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  }

  getCompletedCount(): number {
    const snapshot = this.executionSnapshot();
    if (!snapshot) return 0;

    const completedStates = ['success', 'failed', 'skipped'];
    return snapshot.nodeStates.filter(s => completedStates.includes(s.state)).length;
  }

  getFailedCount(): number {
    const snapshot = this.executionSnapshot();
    if (!snapshot) return 0;

    return snapshot.nodeStates.filter(s => s.state === 'failed').length;
  }

  getTotalDuration(): string {
    const snapshot = this.executionSnapshot();
    if (!snapshot) return '0s';

    const totalDuration = snapshot.nodeStates
      .filter(s => s.duration)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    return this.formatDuration(totalDuration);
  }

  pauseExecution(): void {
    // Implementation for pausing execution
    console.log('Pausing execution...');
  }

  stopExecution(): void {
    // Implementation for stopping execution
    console.log('Stopping execution...');
  }

  toggleReplay(): void {
    this.isReplaying.update(replaying => !replaying);
    // Implementation for replay functionality
  }

  toggleSettings(): void {
    this.showSettings.update(show => !show);
  }

  resumeExecution(action: 'approve' | 'reject'): void {
    this.runtime.resumeWorkflow('current', action);
  }

  updateConfig(): void {
    // The config is already bound to the inputs, so this just triggers reactivity
    this.runtimeState.updateConfig(this.config());
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.timeline-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}