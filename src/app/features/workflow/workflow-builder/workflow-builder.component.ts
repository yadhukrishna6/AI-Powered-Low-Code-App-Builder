import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { WorkflowStateService } from '../services/workflow-state.service';
import { WorkflowRuntimeService } from '../execution/workflow-runtime.service';
import { NodePaletteComponent } from '../palette/node-palette.component';
import { WorkflowCanvasComponent } from '../canvas/workflow-canvas.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';
import { ModalService } from '../../../core/services/modal.service';

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
      <header class="builder-header">
        <div class="header-main">
          <div class="workflow-meta">
            <span class="material-icons title-icon">account_tree</span>
            <div>
              <h1 class="workflow-name">{{ projectService.activeProject()?.name ?? state.workflow().name }}</h1>
              <p class="workflow-id">Instance ID: {{ runtime.activeExecutionContext()?.instanceId || 'None' }}</p>
            </div>
          </div>
          
          <div class="header-center">
            <div class="engine-status" [class.active]="isRunning()">
              <span class="status-dot"></span>
              {{ isRunning() ? 'ENGINE ACTIVE' : 'ENGINE IDLE' }}
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-ghost" (click)="saveWorkflow()">
              <span class="material-icons">save</span>
              Save
            </button>
            <div class="divider"></div>
            <button 
              class="btn-run" 
              [disabled]="isRunning()" 
              (click)="runWorkflow()"
            >
              <span class="material-icons">{{ isRunning() ? 'sync' : 'play_arrow' }}</span>
              {{ isRunning() ? 'RUNNING...' : 'EXECUTE WORKFLOW' }}
            </button>
          </div>
        </div>
      </header>

      <div class="builder-content">
        <!-- Center Canvas -->
        <main class="canvas-region" style="order: 2;">
          <app-workflow-canvas></app-workflow-canvas>
        </main>

        <!-- Left Palette -->
        <aside class="side-panel panel-left" style="order: 1;">
          <app-node-palette></app-node-palette>
        </aside>

        <!-- Right Properties -->
        <aside class="side-panel panel-right" style="order: 3;">
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
    }

    .builder-header {
      height: 72px;
      padding: 0 2rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      z-index: 100;
    }

    .header-main {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .workflow-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .title-icon { color: var(--accent); font-size: 2rem; }
    .workflow-name { font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary); }
    .workflow-id { font-size: 0.65rem; color: var(--text-secondary); margin: 0; font-family: monospace; }

    .header-center {
      background: var(--input-bg);
      padding: 6px 16px;
      border-radius: 20px;
      border: 1px solid var(--border);
    }
    .engine-status {
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot { width: 8px; height: 8px; background: var(--border); border-radius: 50%; }
    .engine-status.active { color: #10b981; }
    .engine-status.active .status-dot { background: #10b981; box-shadow: 0 0 8px #10b981; animation: blink 1s infinite; }

    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .divider { width: 1px; height: 24px; background: var(--border); }

    .btn-ghost {
      display: flex; align-items: center; gap: 8px;
      background: none; border: none; color: var(--text-secondary);
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
      transition: color 0.2s;
    }
    .btn-ghost:hover { color: var(--accent); }

    .btn-run {
      display: flex; align-items: center; gap: 8px;
      background: var(--accent); color: white;
      border: none; padding: 10px 20px; border-radius: 10px;
      font-size: 0.85rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
    }
    .btn-run:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.4); }
    .btn-run:disabled { opacity: 0.6; cursor: wait; }

    .builder-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .side-panel {
      width: 320px;
      flex-shrink: 0;
      background: var(--bg-secondary);
      position: relative;
      z-index: 50;
    }
    .panel-left { border-right: 1px solid var(--border); }
    .panel-right { border-left: 1px solid var(--border); }

    .canvas-region {
      flex: 1;
      background: var(--bg-primary);
      position: relative;
    }
  `]
})
export class WorkflowBuilderComponent implements OnInit {
  state = inject(WorkflowStateService);
  runtime = inject(WorkflowRuntimeService);
  route = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  modal = inject(ModalService);

  isRunning = computed(() => this.runtime.activeExecutionContext()?.status === 'active');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.setActiveProject(id);
      // Load workflow from API
      this.state.loadWorkflowFromApi(id);
    }
  }

  async runWorkflow() {
    const workflow = this.state.workflow();
    this.runtime.resetWorkflowStatus(workflow);
    await this.runtime.executeWorkflow(workflow);
  }

  async saveWorkflow() {
    await this.state.saveWorkflow();
    await this.modal.show({
      title: 'Workflow Saved',
      message: 'Your automation workflow has been successfully saved to the database.',
      type: 'success',
      confirmText: 'Great!'
    });
  }
}
