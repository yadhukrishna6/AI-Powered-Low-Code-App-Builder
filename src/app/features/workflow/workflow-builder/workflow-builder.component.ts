import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkflowStateService } from '../services/workflow-state.service';
import { WorkflowRuntimeService } from '../services/workflow-runtime.service';
import { NodePaletteComponent } from '../palette/node-palette.component';
import { WorkflowCanvasComponent } from '../canvas/workflow-canvas.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule,
    NodePaletteComponent,
    WorkflowCanvasComponent,
    PropertiesPanelComponent
  ],
  template: `
    <div class="workflow-container">
      <!-- Top Bar (Optional, can reuse existing or add unique one) -->
      <div class="workflow-header">
        <div class="header-left">
          <span class="workflow-name">{{ state.workflow().name }}</span>
          <span class="status-badge" [class.active]="isRunning">
            {{ isRunning ? 'Running...' : 'Draft' }}
          </span>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="saveWorkflow()">Save</button>
          <button class="btn btn-primary" [disabled]="isRunning" (click)="runWorkflow()">
            <span class="icon">▶</span> Run Workflow
          </button>
        </div>
      </div>

      <div class="workflow-content">
        <!-- Left: Palette -->
        <aside class="panel-left">
          <app-node-palette></app-node-palette>
        </aside>

        <!-- Center: Canvas -->
        <main class="canvas-area">
          <app-workflow-canvas></app-workflow-canvas>
        </main>

        <!-- Right: Properties -->
        <aside class="panel-right">
          <app-properties-panel></app-properties-panel>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .workflow-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary);
      color: var(--text-primary);
      overflow: hidden;
    }

    .workflow-header {
      height: 64px;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      background: var(--bg-secondary);
      z-index: 10;
    }

    .header-left { display: flex; align-items: center; gap: 1rem; }
    .workflow-name { font-weight: 700; font-size: 1.1rem; }
    
    .status-badge {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--border);
      color: var(--text-secondary);
    }
    .status-badge.active {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .header-actions { display: flex; gap: 0.75rem; }

    .btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary { background: var(--accent); color: white; }
    .btn-secondary { border: 1px solid var(--border); color: var(--text-primary); }
    .btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .workflow-content {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .panel-left {
      width: 280px;
      border-right: 1px solid var(--border);
      background: var(--bg-secondary);
      z-index: 5;
    }

    .canvas-area {
      flex: 1;
      position: relative;
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      background-size: 20px 20px;
      overflow: hidden;
    }

    .panel-right {
      width: 320px;
      border-left: 1px solid var(--border);
      background: var(--bg-secondary);
      z-index: 5;
    }
  `]
})
export class WorkflowBuilderComponent {
  state = inject(WorkflowStateService);
  runtime = inject(WorkflowRuntimeService);
  isRunning = false;

  async runWorkflow() {
    this.isRunning = true;
    try {
      await this.runtime.executeWorkflow(this.state.exportWorkflow());
    } catch (error) {
      console.error('Workflow execution failed', error);
    } finally {
      this.isRunning = false;
    }
  }

  saveWorkflow() {
    const data = this.state.exportWorkflow();
    console.log('Saving Workflow:', data);
    // Persist to backend...
  }
}
