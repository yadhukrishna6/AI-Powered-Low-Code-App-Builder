import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { WorkflowStateService } from '../services/workflow-state.service';
import { WorkflowRuntimeService } from '../execution/workflow-runtime.service';
import { NodePaletteComponent } from '../palette/node-palette.component';
import { WorkflowCanvasComponent } from '../canvas/workflow-canvas.component';
import { PropertiesPanelComponent } from '../properties-panel/properties-panel.component';
import { ExecutionLogsComponent } from '../execution/execution-logs.component';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule,
    NodePaletteComponent,
    WorkflowCanvasComponent,
    PropertiesPanelComponent,
    ExecutionLogsComponent
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

        <!-- Right Properties or Logs -->
        <aside class="side-panel panel-right" style="order: 3;">
          <app-execution-logs *ngIf="showLogs()"></app-execution-logs>
          <app-properties-panel *ngIf="!showLogs()"></app-properties-panel>
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
    }

    .builder-header {
      height: 72px;
      padding: 0 2rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      z-index: 100;
      box-shadow: var(--card-shadow);
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
      gap: 1.25rem;
    }
    .title-icon { 
      color: var(--text-primary); 
      font-size: 1.8rem;
      background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.2));
    }
    .workflow-name { font-size: 1rem; font-weight: 700; margin: 0; color: var(--text-primary); letter-spacing: -0.01em; }
    .workflow-id { font-size: 0.6rem; color: var(--text-secondary); margin: 0; font-family: 'Fira Code', monospace; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.7; }

    .header-center {
      background: var(--input-bg);
      padding: 8px 20px;
      border-radius: 100px;
      border: 1px solid var(--border);
    }
    .engine-status {
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .status-dot { width: 6px; height: 6px; background: var(--border); border-radius: 50%; transition: all 0.3s; }
    .engine-status.active { color: #10b981; }
    .engine-status.active .status-dot { background: #10b981; box-shadow: 0 0 12px #10b981; animation: pulse-green 2s infinite; }

    @keyframes pulse-green { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }

    .header-actions { display: flex; align-items: center; gap: 1.5rem; }
    .divider { width: 1px; height: 28px; background: var(--border); }

    .btn-ghost {
      display: flex; align-items: center; gap: 8px;
      background: none; border: none; color: var(--text-secondary);
      font-size: 0.8rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .btn-ghost:hover { color: var(--text-primary); }

    .btn-run {
      display: flex; align-items: center; gap: 10px;
      background: var(--accent);
      color: var(--bg-primary);
      border: none; padding: 12px 24px; border-radius: 12px;
      font-size: 0.8rem; font-weight: 800; cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .btn-run:hover:not(:disabled) { 
      transform: translateY(-2px); 
      box-shadow: 0 8px 24px rgba(var(--accent-rgb), 0.3);
      filter: brightness(1.1);
    }
    .btn-run:active { transform: translateY(0); }
    .btn-run:disabled { opacity: 0.4; cursor: wait; filter: grayscale(1); }
    .btn-run .material-icons { font-size: 1.2rem; }

    .builder-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .side-panel {
      width: 340px;
      flex-shrink: 0;
      background: var(--bg-secondary);
      position: relative;
      z-index: 50;
      transition: all 0.3s;
    }
    .panel-left { border-right: 1px solid var(--border); }
    .panel-right { border-left: 1px solid var(--border); }

    .canvas-region {
      flex: 1;
      background: transparent;
      position: relative;
      background-image: 
        radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.03) 1px, transparent 0);
      background-size: 32px 32px;
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
  showLogs = computed(() => this.runtime.activeExecutionContext() !== null);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Check if the URL contains 'project/' to determine if this is a project ID
    const isProjectScoped = this.route.snapshot.url.some(segment => segment.path === 'project') || 
                           window.location.pathname.includes('/project/');

    console.log(`Initializing Workflow Builder (${isProjectScoped ? 'Project' : 'Workflow'} mode) for ID:`, id);
    
    let loaded = false;

    if (isProjectScoped) {
      // 1. In project mode, always look for the project's workflow first
      const existingWorkflowId = await this.state.loadWorkflowByProject(id);
      if (existingWorkflowId) {
        loaded = true;
      } else {
        // 2. Auto-create if project has no workflow
        console.log('No workflow found for project. Creating first automation flow...');
        await this.state.createWorkflow(id, 'Automation Flow');
        loaded = true;
      }
    } else {
      // 3. Direct Workflow ID mode
      loaded = await this.state.loadWorkflowFromApi(id);
    }

    if (!loaded) {
      console.error('Failed to load or initialize workflow for ID:', id);
      return;
    }

    // 4. Finalize project context (load forms/metadata)
    const workflow = this.state.workflow();
    const projectId = (workflow as any).projectId || id;

    if (projectId) {
      try {
        const fullProject = await this.projectService.getProject(projectId);
        this.projectService.updateProjectInSignal(fullProject);
        this.projectService.setActiveProject(projectId);
        console.log('Project context synchronized successfully.');
      } catch (e) {
        console.warn('Project details could not be fetched, continuing with basic context.');
      }
    }
  }

  async runWorkflow() {
    const workflow = this.state.workflow();
    this.runtime.resetWorkflowStatus(workflow);
    
    // Check if the workflow has input dependencies (like the 'date' field that failed earlier)
    const variablesRaw = prompt('Enter initial variables (JSON) for testing (optional):', '{}');
    let variables = {};
    
    try {
      if (variablesRaw) {
        variables = JSON.parse(variablesRaw);
      }
    } catch (e) {
      console.warn('Invalid JSON for variables, starting with empty context.');
    }

    await this.runtime.executeWorkflow(workflow, variables);
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
