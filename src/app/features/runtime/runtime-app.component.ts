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

@Component({
  selector: 'app-runtime-app',
  standalone: true,
  imports: [CommonModule, DynamicRendererComponent, FormsModule],
  template: `
    <div class="runtime-layout">
      <!-- App Header -->
      <header class="app-header">
        <div class="header-content">
          <div class="app-info">
            <span class="material-icons app-icon">apps</span>
            <h1>{{ projectName() }}</h1>
          </div>
          <div class="user-profile">
            <div class="avatar">Y</div>
            <span class="user-name">Yadhukrishna</span>
          </div>
        </div>
      </header>

      <main class="app-body">
        <div class="form-container fade-in">
          <div class="form-card">
            <div class="form-header">
              <h2>{{ formName() || 'Application Form' }}</h2>
              <p>{{ formDescription() || 'Please fill in the details below to submit your request.' }}</p>
            </div>

            <div class="form-content">
              <!-- Reusing the dynamic renderer for each field -->
              <div class="runtime-grid">
                <app-dynamic-renderer 
                  *ngFor="let field of formService.formFields()"
                  [field]="field"
                  [isRuntime]="true"
                  (fieldChange)="onFieldChange($event)"
                ></app-dynamic-renderer>
              </div>
            </div>

            <div class="form-footer">
              <button class="btn-reset" (click)="resetForm()">Reset</button>
              <button 
                class="btn-submit" 
                [disabled]="isSubmitting()" 
                (click)="submitForm()"
              >
                <span class="material-icons">{{ isSubmitting() ? 'sync' : 'send' }}</span>
                {{ isSubmitting() ? 'Submitting...' : 'Submit Request' }}
              </button>
            </div>
          </div>

          <!-- Workflow Progress Indicator -->
          <div class="workflow-overlay" *ngIf="isSubmitting()">
            <div class="overlay-content">
              <div class="spinner"></div>
              <h3>Processing Automation</h3>
              <p>Your request is being routed through the approval workflow...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .runtime-layout {
      min-height: 100vh;
      background: var(--bg-primary);
      display: flex;
      flex-direction: column;
    }

    .app-header {
      height: 72px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .header-content {
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-info { display: flex; align-items: center; gap: 1rem; }
    .app-icon { color: var(--accent); font-size: 2rem; }
    .app-info h1 { font-size: 1.1rem; font-weight: 700; margin: 0; }

    .user-profile { display: flex; align-items: center; gap: 0.75rem; }
    .avatar { 
      width: 36px; height: 36px; 
      background: var(--accent); color: white; 
      border-radius: 50%; display: flex; 
      align-items: center; justify-content: center; 
      font-size: 0.8rem; font-weight: 700; 
    }
    .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }

    .app-body {
      flex: 1;
      padding: 3rem 1rem;
      display: flex;
      justify-content: center;
    }

    .form-container {
      width: 100%;
      max-width: 800px;
      position: relative;
    }

    .form-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 24px;
      box-shadow: var(--card-shadow);
      overflow: hidden;
    }

    .form-header { padding: 2.5rem; border-bottom: 1px solid var(--border); }
    .form-header h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .form-header p { color: var(--text-secondary); font-size: 0.9rem; }

    .form-content { padding: 2.5rem; }

    .runtime-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1.5rem;
    }

    .form-footer {
      padding: 1.5rem 2.5rem;
      background: var(--bg-primary);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-reset {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-reset:hover { background: var(--input-bg); color: var(--text-primary); }

    .btn-submit {
      background: var(--accent);
      color: white;
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.3);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.4); }
    .btn-submit:disabled { opacity: 0.6; cursor: wait; }

    .workflow-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(var(--bg-secondary-rgb), 0.9);
      backdrop-filter: blur(10px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 24px;
      text-align: center;
    }

    .overlay-content { max-width: 320px; }
    .spinner {
      width: 48px; height: 48px;
      border: 4px solid rgba(var(--accent-rgb), 0.1);
      border-top-color: var(--accent);
      border-radius: 50%;
      margin: 0 auto 1.5rem;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RuntimeAppComponent implements OnInit {
  formService = inject(FormBuilderService);
  workflowRuntime = inject(WorkflowRuntimeService);
  workflowState = inject(WorkflowStateService);
  projectService = inject(ProjectService);
  ruleEngine = inject(RuleEngineService);
  modal = inject(ModalService);
  route = inject(ActivatedRoute);

  projectName = signal('Loading Project...');
  formName = signal('');
  formDescription = signal('');
  isSubmitting = signal(false);
  formData: any = {};

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
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
