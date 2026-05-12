import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowStateService } from '../services/workflow-state.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-execution-replay',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="replay-bar glass">
      <div class="replay-info">
        <span class="material-icons">history</span>
        <div class="text">
          <strong>Replay Mode</strong>
          <span>Execution: {{ executionId }}</span>
        </div>
      </div>

      <div class="scrubber-container">
        <input type="range" 
               [max]="logs().length - 1" 
               [min]="0" 
               [(ngModel)]="currentIndex" 
               (input)="onScrub($event)"
               class="scrubber">
        <div class="scrubber-labels">
          <span>Start</span>
          <span>Step {{ currentIndex() + 1 }} of {{ logs().length }}</span>
          <span>End</span>
        </div>
      </div>

      <div class="replay-controls">
        <button (click)="prevStep()" [disabled]="currentIndex() === 0">
          <span class="material-icons">skip_previous</span>
        </button>
        <button (click)="togglePlay()">
          <span class="material-icons">{{ isPlaying() ? 'pause' : 'play_arrow' }}</span>
        </button>
        <button (click)="nextStep()" [disabled]="currentIndex() === logs().length - 1">
          <span class="material-icons">skip_next</span>
        </button>
      </div>

      <button class="exit-btn" (click)="exitReplay()">Exit Replay</button>
    </div>

    <div class="side-panel glass" *ngIf="currentLog()">
      <h3>Step Details</h3>
      <div class="detail-row">
        <label>Node</label>
        <span>{{ currentLog().nodeId }} ({{ currentLog().nodeType }})</span>
      </div>
      <div class="detail-row">
        <label>Status</label>
        <span [class]="currentLog().status">{{ currentLog().status }}</span>
      </div>
      <div class="data-box" *ngIf="currentLog().output">
        <label>Output Snapshot</label>
        <pre>{{ currentLog().output | json }}</pre>
      </div>
    </div>
  `,
  styles: [`
    .replay-bar {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 80px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 32px;
      z-index: 1000;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }

    .replay-info { display: flex; align-items: center; gap: 12px; min-width: 150px; }
    .replay-info .material-icons { color: var(--primary); font-size: 2rem; }
    .replay-info .text { display: flex; flex-direction: column; }
    .replay-info strong { font-size: 0.9rem; }
    .replay-info span { font-size: 0.7rem; color: var(--text-secondary); }

    .scrubber-container { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .scrubber { 
      width: 100%; 
      accent-color: var(--primary); 
      cursor: pointer;
      height: 6px;
      border-radius: 3px;
    }
    .scrubber-labels { display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--text-secondary); }

    .replay-controls { display: flex; gap: 12px; }
    .replay-controls button { 
      background: rgba(255,255,255,0.05); 
      border: none; 
      color: white; 
      width: 40px; 
      height: 40px; 
      border-radius: 50%; 
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .replay-controls button:hover:not(:disabled) { background: var(--primary); }
    .replay-controls button:disabled { opacity: 0.3; cursor: not-allowed; }

    .exit-btn {
      background: #ef4444;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .side-panel {
      position: fixed;
      right: 24px;
      top: 100px;
      width: 320px;
      max-height: 60vh;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
    }

    .detail-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
    .detail-row label { color: var(--text-secondary); }
    .detail-row .success { color: #10b981; }
    .detail-row .failed { color: #ef4444; }

    .data-box { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; }
    .data-box label { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px; display: block; }
    pre { font-size: 0.7rem; color: #a78bfa; margin: 0; overflow-x: auto; }

    .glass {
      background: rgba(20, 20, 20, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      color: white;
    }
  `]
})
export class ExecutionReplayComponent implements OnInit {
  workflowState = inject(WorkflowStateService);
  route = inject(ActivatedRoute);

  executionId = '';
  logs = signal<any[]>([]);
  currentIndex = signal<number>(0);
  isPlaying = signal<boolean>(false);
  
  currentLog = computed(() => this.logs()[this.currentIndex()]);

  async ngOnInit() {
    this.executionId = this.route.snapshot.params['id'];
    if (this.executionId) {
      const data = await this.workflowState.loadExecutionHistory(this.executionId);
      if (data) {
        this.logs.set(data.logs || []);
        this.onScrub(0);
      }
    }
  }

  onScrub(event: any) {
    const index = typeof event === 'number' ? event : parseInt(event.target.value);
    this.currentIndex.set(index);
    this.updateVisuals();
  }

  updateVisuals() {
    this.workflowState.resetExecutionStates();
    const currentLogs = this.logs().slice(0, this.currentIndex() + 1);
    
    currentLogs.forEach(log => {
      this.workflowState.updateNodeStatus(log.nodeId, log.status, log.error);
    });
  }

  nextStep() {
    if (this.currentIndex() < this.logs().length - 1) {
      this.onScrub(this.currentIndex() + 1);
    } else {
      this.isPlaying.set(false);
    }
  }

  prevStep() {
    if (this.currentIndex() > 0) {
      this.onScrub(this.currentIndex() - 1);
    }
  }

  togglePlay() {
    this.isPlaying.set(!this.isPlaying());
    if (this.isPlaying()) {
      this.playLoop();
    }
  }

  private playLoop() {
    if (!this.isPlaying()) return;
    this.nextStep();
    setTimeout(() => this.playLoop(), 1000);
  }

  exitReplay() {
    // Navigate back or reset state
    window.history.back();
  }
}
