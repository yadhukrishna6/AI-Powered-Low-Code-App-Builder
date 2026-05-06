// Workspace dashboard
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../core/services/project.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>My Workspace</h1>
          <p *ngIf="projectService.projects().length > 0">You have {{ projectService.projects().length }} active projects.</p>
          <p *ngIf="projectService.projects().length === 0">Start your first project to begin building.</p>
        </div>
        <div class="header-actions">
          <button class="btn-create" (click)="showModal.set(true)">
            <span class="material-icons">add</span>
            New Application
          </button>
        </div>
      </header>

      <section class="projects-section">
        <div class="projects-grid">
          <div *ngFor="let project of projectService.projects()" class="project-card" (click)="navigateToProject(project)">
            <div class="card-preview" [style.background-color]="project.thumbnailColor">
              <span class="material-icons">rocket_launch</span>
            </div>
            <div class="card-content">
              <div class="card-top">
                <span class="badge">Workspace</span>
                <span class="status" [class]="project.status.toLowerCase()">{{ project.status }}</span>
              </div>
              <h3>{{ project.name }}</h3>
              <p>{{ project.description }}</p>
              <div class="card-footer">
                <span>Modified {{ project.lastModified | date:'shortTime' }}</span>
                <button class="icon-btn" (click)="$event.stopPropagation(); deleteProject(project.id)">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          </div>

          <div class="create-card" (click)="showModal.set(true)">
            <div class="create-inner">
              <span class="material-icons">add_circle_outline</span>
              <span>Create New Workspace</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Create Project Modal -->
      <div class="modal-overlay" *ngIf="showModal()">
        <div class="modal-content fade-in">
          <div class="modal-header">
            <h2>Create New Workspace</h2>
            <button class="close-btn" (click)="showModal.set(false)">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label>Workspace Name</label>
              <input type="text" [(ngModel)]="newName" placeholder="e.g. Sales CRM">
            </div>

            <div class="form-group">
              <label>Description (Optional)</label>
              <textarea [(ngModel)]="newDesc" placeholder="What is this workspace for?"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="showModal.set(false)">Cancel</button>
            <button class="btn-primary" (click)="createProject()" [disabled]="!newName">Create Workspace</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2.5rem;
      height: 100%;
      overflow-y: auto;
      background: var(--bg-primary);
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }
    .header-content h1 { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
    .header-content p { color: var(--text-secondary); font-size: 1rem; }

    .btn-create {
      background: var(--accent);
      color: var(--bg-primary);
      padding: 0.8rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 4px 15px rgba(var(--accent-rgb), 0.2);
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .project-card {
      background: var(--bg-secondary);
      border-radius: 24px;
      border: 1px solid var(--border);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .project-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }

    .card-preview {
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .card-preview .material-icons { font-size: 3rem; color: rgba(255,255,255,0.9); }

    .card-content { padding: 1.5rem; }
    .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .badge { font-size: 0.65rem; font-weight: 800; padding: 2px 8px; background: var(--input-bg); border-radius: 6px; text-transform: uppercase; color: var(--text-secondary); }
    .status { font-size: 0.7rem; font-weight: 700; }
    .status.published { color: #10b981; }
    .status.draft { color: #f59e0b; }

    h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
    p { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; height: 2.6rem; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 1rem; color: var(--text-secondary); font-size: 0.75rem; }
    .icon-btn { color: var(--text-secondary); transition: color 0.2s; }
    .icon-btn:hover { color: #ef4444; }

    .create-card {
      border: 2px dashed var(--border);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      min-height: 320px;
      transition: all 0.2s;
    }
    .create-card:hover { border-color: var(--accent); background: rgba(var(--accent-rgb), 0.02); }
    .create-inner { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: var(--text-secondary); font-weight: 600; }
    .create-inner .material-icons { font-size: 3rem; opacity: 0.3; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--bg-secondary);
      width: 100%;
      max-width: 500px;
      border-radius: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
    .modal-header h2 { font-size: 1.25rem; font-weight: 800; }
    .close-btn { color: var(--text-secondary); }

    .modal-body { padding: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.5rem; }
    
    input, textarea {
      width: 100%;
      padding: 0.8rem 1rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    input:focus, textarea:focus { border-color: var(--accent); outline: none; }

    .type-selector { display: flex; gap: 1rem; }
    .type-selector button {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--bg-primary);
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .type-selector button.active {
      border-color: var(--accent);
      background: rgba(var(--accent-rgb), 0.05);
      color: var(--accent);
    }
    .type-selector .material-icons { font-size: 1.75rem; }
    .type-selector span { font-weight: 700; font-size: 0.85rem; }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .btn-secondary { padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; color: var(--text-secondary); }
    .btn-primary { 
      background: var(--accent); 
      color: var(--bg-primary); 
      padding: 0.75rem 1.5rem; 
      border-radius: 12px; 
      font-weight: 700; 
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class DashboardComponent {
  projectService = inject(ProjectService);
  router = inject(Router);

  showModal = signal(false);
  newName = '';
  newDesc = '';

  navigateToProject(project: Project) {
    this.projectService.setActiveProject(project.id);
    this.router.navigate(['/project', project.id, 'designer']);
  }

  createProject() {
    if (!this.newName) return;
    const project = this.projectService.addProject(this.newName, this.newDesc);
    this.showModal.set(false);
    this.newName = '';
    this.newDesc = '';
    // Navigate immediately to the new workspace designer
    this.navigateToProject(project);
  }

  private modalService = inject(ModalService);

  async deleteProject(id: string) {
    const confirmed = await this.modalService.show({
      title: 'Delete Workspace',
      message: 'Are you sure you want to permanently delete this workspace and all its data? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete Forever'
    });
    
    if (confirmed) {
      this.projectService.deleteProject(id);
    }
  }
}
