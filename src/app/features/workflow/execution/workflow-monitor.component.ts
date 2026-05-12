import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../services/monitoring.service';
import { WorkflowStateService } from '../services/workflow-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workflow-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="monitor-container">
      <header class="monitor-header">
        <div class="header-left">
          <span class="status-dot pulse"></span>
          <h1>Live Operations Center</h1>
          <span class="workflow-name">{{ workflowState.workflow().name }}</span>
        </div>
        <div class="header-right">
          <button class="control-btn"><span class="material-icons">pause_circle</span> Pause Monitor</button>
          <button class="control-btn primary"><span class="material-icons">refresh</span> Force Sync</button>
        </div>
      </header>

      <div class="stats-grid">
        <div class="stat-card glass">
          <label>Active Instances</label>
          <div class="value">{{ activeInstances }}</div>
          <div class="trend up"><span class="material-icons">trending_up</span> +12%</div>
        </div>
        <div class="stat-card glass">
          <label>Success Rate</label>
          <div class="value">98.4%</div>
          <div class="trend"><span class="material-icons">check_circle</span> Stable</div>
        </div>
        <div class="stat-card glass">
          <label>Avg. Duration</label>
          <div class="value">1.2s</div>
          <div class="trend down"><span class="material-icons">speed</span> -200ms</div>
        </div>
        <div class="stat-card glass failed">
          <label>Failed (Last 1h)</label>
          <div class="value">2</div>
          <div class="trend warning"><span class="material-icons">error</span> Attention</div>
        </div>
      </div>

      <div class="main-content">
        <div class="live-feed glass">
          <div class="feed-header">
            <h3>Execution Stream</h3>
            <span class="live-indicator">LIVE</span>
          </div>
          <div class="feed-list">
            <div *ngFor="let event of executionEvents" class="feed-item" [class.new]="event.isNew">
              <div class="item-icon" [style.background]="event.color">
                <span class="material-icons">{{ event.icon }}</span>
              </div>
              <div class="item-details">
                <div class="item-title">{{ event.title }}</div>
                <div class="item-meta">Execution: {{ event.executionId }} • {{ event.time }}</div>
              </div>
              <div class="item-status" [class]="event.status">{{ event.status }}</div>
            </div>
          </div>
        </div>

        <div class="node-heatmap glass">
          <h3>Node Performance Heatmap</h3>
          <div class="heatmap-grid">
             <div *ngFor="let node of workflowState.nodes()" 
                  class="heatmap-cell" 
                  [title]="node.label"
                  [style.opacity]="getHeatmapOpacity(node.id)">
                <span class="material-icons">{{ node.subType === 'api-request' ? 'http' : 'settings' }}</span>
             </div>
          </div>
          <div class="heatmap-legend">
             <span>Less Active</span>
             <div class="gradient-bar"></div>
             <span>Hot</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .monitor-container {
      padding: 24px;
      height: 100%;
      background: var(--bg-dark);
      color: var(--text-primary);
      display: flex;
      flex-direction: column;
      gap: 24px;
      font-family: 'Inter', sans-serif;
    }

    .monitor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }

    .pulse { animation: pulse-animation 2s infinite; }

    @keyframes pulse-animation {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
    }

    h1 { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
    .workflow-name { color: var(--text-secondary); font-size: 0.9rem; }

    .control-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .control-btn.primary { background: var(--primary); border: none; }
    .control-btn:hover { background: rgba(255, 255, 255, 0.1); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .glass {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 20px;
    }

    .stat-card label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .stat-card .value { font-size: 2rem; font-weight: 700; margin: 8px 0; }
    .stat-card .trend { font-size: 0.75rem; display: flex; align-items: center; gap: 4px; }
    .trend.up { color: #10b981; }
    .trend.warning { color: #f59e0b; }

    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;
      flex: 1;
      min-height: 0;
    }

    .live-feed { display: flex; flex-direction: column; gap: 16px; min-height: 0; }
    .feed-header { display: flex; justify-content: space-between; align-items: center; }
    .live-indicator { background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; }

    .feed-list { overflow-y: auto; display: flex; flex-direction: column; gap: 12px; }
    .feed-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.02);
      transition: all 0.3s ease;
    }
    .feed-item.new { background: rgba(59, 130, 246, 0.1); transform: translateX(5px); }

    .item-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .item-details { flex: 1; }
    .item-title { font-size: 0.85rem; font-weight: 600; }
    .item-meta { font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px; }
    .item-status { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
    .item-status.success { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .item-status.running { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .item-status.failed { color: #ef4444; background: rgba(239, 68, 68, 0.1); }

    .node-heatmap h3 { font-size: 0.9rem; margin-top: 0; margin-bottom: 20px; }
    .heatmap-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 10px; }
    .heatmap-cell {
      aspect-ratio: 1;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: help;
    }
    .heatmap-legend { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; font-size: 0.7rem; color: var(--text-secondary); }
    .gradient-bar { flex: 1; height: 4px; margin: 0 12px; background: linear-gradient(to right, rgba(167, 139, 250, 0.1), var(--primary)); border-radius: 2px; }
  `]
})
export class WorkflowMonitorComponent implements OnInit, OnDestroy {
  monitoring = inject(MonitoringService);
  workflowState = inject(WorkflowStateService);

  activeInstances = 12;
  executionEvents: any[] = [];
  private subscriptions = new Subscription();

  ngOnInit() {
    const dbId = this.workflowState.getDbId();
    if (dbId) {
      this.monitoring.listenToExecution(dbId);
    }

    this.subscriptions.add(
      this.monitoring.getNodeUpdates().subscribe(update => {
        this.addEvent(update);
      })
    );

    // Mock initial data
    this.executionEvents = [
      { id: '1', executionId: 'exe_7b2', title: 'API Request - Get User', status: 'success', icon: 'http', color: '#3b82f6', time: '2m ago' },
      { id: '2', executionId: 'exe_7b2', title: 'Condition - Check Status', status: 'success', icon: 'call_split', color: '#f59e0b', time: '1m ago' },
      { id: '3', executionId: 'exe_9c4', title: 'Start - Manual Trigger', status: 'running', icon: 'play_arrow', color: '#10b981', time: 'Just now' }
    ];
  }

  addEvent(update: any) {
    const node = this.workflowState.nodes().find(n => n.id === update.nodeId);
    const newEvent = {
      id: Math.random().toString(),
      executionId: update.executionId?.substring(0, 8) || 'exe_live',
      title: node?.label || 'Unknown Node',
      status: update.status,
      icon: this.getIcon(node?.subType),
      color: this.getColor(node?.subType),
      time: 'Just now',
      isNew: true
    };

    this.executionEvents.unshift(newEvent);
    if (this.executionEvents.length > 50) this.executionEvents.pop();

    setTimeout(() => newEvent.isNew = false, 1000);
  }

  getIcon(subType: string | undefined): string {
    switch (subType) {
      case 'start': return 'play_arrow';
      case 'condition': return 'call_split';
      case 'api-request': return 'http';
      case 'approval': return 'how_to_reg';
      default: return 'settings';
    }
  }

  getColor(subType: string | undefined): string {
    switch (subType) {
      case 'start': return '#10b981';
      case 'condition': return '#f59e0b';
      case 'api-request': return '#3b82f6';
      default: return '#a855f7';
    }
  }

  getHeatmapOpacity(nodeId: string): number {
    // Mock heatmap logic
    const base = 0.2;
    const random = Math.random() * 0.8;
    return base + random;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
