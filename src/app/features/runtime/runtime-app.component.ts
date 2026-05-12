import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilderService } from '../../core/services/form-builder.service';
import { WorkflowRuntimeService } from '../workflow/execution/workflow-runtime.service';
import { WorkflowStateService } from '../workflow/services/workflow-state.service';
import { RuleEngineService } from '../../core/services/rule-engine.service';
import { ProjectService } from '../../core/services/project.service';
import { DynamicRendererComponent } from '../builder/components/canvas/dynamic-renderer.component';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../core/services/modal.service';
import { AppDesignerService } from '../app-designer/services/app-designer.service';
import { RouterModule } from '@angular/router';

import { PageResolverComponent } from './components/page-resolver/page-resolver.component';

@Component({
  selector: 'app-runtime-app',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PageResolverComponent],
  template: `
    <div class="runtime-layout" *ngIf="appService.layout() as layout">
      <!-- App Shell: Sidebar -->
      <aside class="app-sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
           <div class="app-logo">
             <span class="material-icons">rocket_launch</span>
           </div>
           <span class="app-title">{{ projectName() }}</span>
        </div>

        <nav class="sidebar-nav">
           <!-- Dynamic Navigation from Layout Metadata -->
           <div *ngFor="let item of layout.navigation.sidebar" 
                class="nav-item" 
                [routerLink]="['/project', layout.projectId, 'runtime']" 
                [queryParams]="{ route: item.route }"
                routerLinkActive="active">
             <span class="material-icons">{{ item.icon }}</span>
             <span class="label">{{ item.label }}</span>
           </div>
        </nav>

        <div class="sidebar-footer">
           <div class="user-block">
             <div class="avatar">Y</div>
             <span class="user-name">Yadhukrishna</span>
           </div>
        </div>
      </aside>

      <!-- Main Container -->
      <div class="main-region">
        <header class="app-topbar">
          <div class="topbar-left">
            <button class="menu-toggle" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
              <span class="material-icons">menu</span>
            </button>
            <h2 class="page-title">{{ activePageName() }}</h2>
          </div>
          <div class="topbar-right">
             <button class="btn-icon"><span class="material-icons">notifications</span></button>
             <button class="btn-icon"><span class="material-icons">search</span></button>
          </div>
        </header>

        <main class="app-content fade-in">
          <div class="content-wrapper">
             <app-page-resolver></app-page-resolver>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .runtime-layout { display: flex; height: 100vh; background: var(--bg-primary); }
    
    /* Dynamic Sidebar */
    .app-sidebar {
      width: 260px; background: var(--bg-secondary); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; transition: all 0.3s;
    }
    .app-sidebar.collapsed { width: 80px; }
    
    .sidebar-header { height: 72px; padding: 0 1.5rem; display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border); }
    .app-logo { width: 32px; height: 32px; background: var(--accent); color: var(--bg-primary); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .app-title { font-weight: 800; font-size: 1rem; white-space: nowrap; overflow: hidden; }
    
    .sidebar-nav { flex: 1; padding: 1.5rem 0; }
    .nav-item { 
      padding: 0.85rem 1.5rem; display: flex; align-items: center; gap: 1rem; color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
    }
    .nav-item:hover { background: var(--input-bg); color: var(--text-primary); }
    .nav-item.active { color: var(--accent); background: rgba(var(--accent-rgb), 0.08); border-right: 3px solid var(--accent); }
    .nav-item .material-icons { font-size: 1.25rem; }
    
    /* Main Region */
    .main-region { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .app-topbar { height: 72px; padding: 0 2rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .topbar-left { display: flex; align-items: center; gap: 1rem; }
    .page-title { font-size: 1.1rem; font-weight: 700; margin: 0; }
    
    .app-content { flex: 1; overflow-y: auto; padding: 3rem 2rem; }
    .content-wrapper { max-width: 900px; margin: 0 auto; }
    
    .form-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; box-shadow: var(--card-shadow); }
    .form-header { padding: 2.5rem; border-bottom: 1px solid var(--border); }
    .form-content { padding: 2.5rem; }
    .runtime-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 1.5rem; }
    .form-footer { padding: 1.5rem 2.5rem; background: var(--bg-primary); display: flex; justify-content: flex-end; gap: 1rem; }
    
    .btn-submit { background: var(--accent); color: white; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 700; }
    .btn-reset { color: var(--text-secondary); font-weight: 700; }
    
    .collapsed .app-title, .collapsed .label, .collapsed .user-name { display: none; }
  `]
})
export class RuntimeAppComponent implements OnInit {
  formService = inject(FormBuilderService);
  workflowRuntime = inject(WorkflowRuntimeService);
  workflowState = inject(WorkflowStateService);
  appService = inject(AppDesignerService);
  projectService = inject(ProjectService);
  ruleEngine = inject(RuleEngineService);
  modal = inject(ModalService);
  route = inject(ActivatedRoute);

  projectName = signal('Loading Project...');
  formName = signal('');
  formDescription = signal('');
  isSubmitting = signal(false);
  sidebarCollapsed = signal(false);
  activePageName = signal('Dashboard');
  formData: any = {};

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        await this.appService.loadAppMetadata(id);
        const project = await this.projectService.getProject(id);
        this.projectName.set(project.name);
        
        // Load the first form
        if (project.forms && project.forms.length > 0) {
          const form = project.forms[0];
          this.formName.set(form.name);
          this.formService.loadFormSchema(form.schema);
        }

        // Load the workflow
        await this.workflowState.loadWorkflowByProject(id);
      } catch (e) {
        console.error('Failed to load project for runtime:', e);
        this.projectName.set('Project Not Found');
      }
    }
  }

  onFieldChange(event: { fieldId: string, value: any }) {
    this.formData[event.fieldId] = event.value;
    
    // Evaluate rules (Auto-calculate days, etc.)
    const result = this.ruleEngine.evaluateRules(this.formData);
    this.formData = result.data;
    
    // Sync back to service for renderer to update
    this.formService.formFields.update(fields => 
      fields.map(f => {
        if (this.formData[f.id] !== undefined) {
          return { ...f, defaultValue: this.formData[f.id] };
        }
        return f;
      })
    );
  }

  async submitForm() {
    this.isSubmitting.set(true);

    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    // Trigger Workflow
    const workflow = this.workflowState.exportWorkflow();
    
    // Inject form data into workflow context variables
    const context = {
      ...this.formData,
      totalDays: this.formData.totalDays || 0
    };

    // Execute
    await this.workflowRuntime.executeWorkflow(workflow);

    this.isSubmitting.set(false);

    await this.modal.show({
      title: 'Request Submitted',
      message: 'Your leave request has been successfully submitted and is now being processed by the approval engine.',
      type: 'success',
      confirmText: 'View Status'
    });
  }

  resetForm() {
    this.formData = {};
    // Reset service fields...
  }
}
