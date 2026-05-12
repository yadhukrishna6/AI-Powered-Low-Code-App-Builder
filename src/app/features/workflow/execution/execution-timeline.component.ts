import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TimelineItem {
  nodeId: string;
  label: string;
  icon: string;
  startTime: number;
  endTime: number;
  duration: number;
  startOffset: number;
  status: string;
}

@Component({
  selector: 'app-execution-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timeline-container glass">
      <div class="timeline-header">
        <div class="title-group">
          <span class="material-icons">analytics</span>
          <h3>Execution Performance</h3>
        </div>
        <div class="legend">
          <span class="legend-item"><span class="dot success"></span> Success</span>
          <span class="legend-item"><span class="dot error"></span> Error</span>
          <span class="legend-item"><span class="dot waiting"></span> Waiting</span>
        </div>
      </div>
      
      <div class="timeline-body" *ngIf="timelineData().length > 0; else noData">
        <div class="time-ruler">
          <span *ngFor="let tick of ticks()">{{ tick }}ms</span>
        </div>

        <div class="rows-container">
          <div *ngFor="let item of timelineData()" class="timeline-row">
            <div class="node-info">
              <span class="node-label">{{ item.label }}</span>
              <span class="node-sub">{{ item.nodeId.substring(0, 8) }}</span>
            </div>
            <div class="bar-track">
              <div 
                class="duration-bar" 
                [style.left.%]="(item.startOffset / totalDuration()) * 100"
                [style.width.%]="(item.duration / totalDuration()) * 100"
                [class]="item.status"
                [title]="item.label + ': ' + item.duration + 'ms'"
              >
                <span class="duration-text" *ngIf="item.duration > 50">{{ item.duration }}ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #noData>
        <div class="empty-state">
          <span class="material-icons">timer</span>
          <p>No execution data available for this session.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .timeline-container {
      border-radius: 16px;
      padding: 24px;
      color: white;
      border: 1px solid rgba(255,255,255,0.1);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title-group { display: flex; align-items: center; gap: 12px; }
    .title-group .material-icons { color: var(--accent); }
    h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }

    .legend { display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-secondary); }
    .legend-item { display: flex; align-items: center; gap: 6px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; }
    .dot.success { background: #10b981; }
    .dot.error { background: #ef4444; }
    .dot.waiting { background: #f59e0b; }

    .timeline-body { position: relative; padding-top: 30px; }

    .time-ruler {
      position: absolute;
      top: 0; left: 140px; right: 0;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      padding-bottom: 8px;
      font-size: 0.65rem;
      color: var(--text-secondary);
    }

    .rows-container { display: flex; flex-direction: column; gap: 12px; }

    .timeline-row {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .node-info {
      width: 120px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .node-label { font-size: 0.8rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .node-sub { font-size: 0.6rem; color: var(--text-secondary); }

    .bar-track {
      flex: 1;
      height: 24px;
      background: rgba(255,255,255,0.03);
      border-radius: 4px;
      position: relative;
    }

    .duration-bar {
      position: absolute;
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      min-width: 4px;
      transition: all 0.3s;
    }

    .duration-bar.success { background: linear-gradient(90deg, #10b981, #059669); }
    .duration-bar.failed, .duration-bar.error { background: linear-gradient(90deg, #ef4444, #dc2626); }
    .duration-bar.waiting { background: linear-gradient(90deg, #f59e0b, #d97706); }

    .duration-text { font-size: 0.65rem; font-weight: 800; color: white; white-space: nowrap; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }

    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-secondary);
      background: rgba(0,0,0,0.1);
      border-radius: 12px;
    }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 12px; opacity: 0.2; }

    .glass {
      background: rgba(20, 20, 20, 0.6);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
    }
  `]
})
export class ExecutionTimelineComponent {
  @Input() set logs(data: any[]) {
    this._logs.set(data);
  }

  private _logs = signal<any[]>([]);

  timelineData = computed(() => {
    const logs = this._logs();
    if (logs.length === 0) return [];

    // Assuming logs have timestamps. If not, we'll simulate based on sequence.
    // For this demo, let's assume each node takes some time or we have real timestamps.
    const startTime = new Date(logs[0].timestamp).getTime();
    
    return logs.map((log, index) => {
      const logTime = new Date(log.timestamp).getTime();
      const duration = log.duration || Math.floor(Math.random() * 500) + 100; // Simulated if missing
      
      return {
        nodeId: log.nodeId,
        label: log.nodeType.toUpperCase(),
        icon: 'code',
        startTime: logTime,
        endTime: logTime + duration,
        duration: duration,
        startOffset: logTime - startTime,
        status: log.status
      };
    });
  });

  totalDuration = computed(() => {
    const data = this.timelineData();
    if (data.length === 0) return 0;
    const lastItem = data[data.length - 1];
    return lastItem.startOffset + lastItem.duration;
  });

  ticks = computed(() => {
    const duration = this.totalDuration();
    const count = 5;
    return Array.from({ length: count + 1 }, (_, i) => Math.round((duration / count) * i));
  });
}
