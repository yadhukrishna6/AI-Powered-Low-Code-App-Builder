// Template library page
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FormBuilderService } from '../../core/services/form-builder.service';
import { ProjectService } from '../../core/services/project.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="templates-page thin-scrollbar">
      <header class="page-header">
        <div class="header-content">
          <button class="back-btn" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
          </button>
          <div>
            <h1>Template Library</h1>
            <p>Select a pre-built template to accelerate your design.</p>
          </div>
        </div>
        <div class="search-bar">
          <span class="material-icons">search</span>
          <input type="text" placeholder="Search templates..." [(ngModel)]="searchQuery">
        </div>
      </header>

      <div class="templates-grid">
        @for (template of filteredTemplates(); track template.id) {
          <div class="template-card">
            <div class="template-preview" [style.background-color]="template.color || '#f3f4f6'">
              <span class="material-icons">{{ template.icon || 'description' }}</span>
            </div>
            <div class="template-info">
              <h3>{{ template.name }}</h3>
              <p>{{ template.description || 'Professional form template for ' + template.name }}</p>
              <div class="template-footer">
                <span class="badge">{{ template.schema?.fields?.length || 0 }} Fields</span>
                <button class="btn-import" (click)="importTemplate(template)">
                  Import Template
                </button>
              </div>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <span class="material-icons">search_off</span>
            <p>No templates found matching your search.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .templates-page {
      padding: 2.5rem;
      background: var(--bg-primary);
      height: 100vh;
      overflow-y: auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }
    .header-content { display: flex; align-items: center; gap: 1.5rem; }
    .back-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .back-btn:hover { background: var(--bg-secondary); color: var(--accent); }
    h1 { font-family: 'Outfit', sans-serif; font-size: 2.5rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    p { color: var(--text-secondary); margin: 0.5rem 0 0; }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      padding: 0.75rem 1.25rem;
      border-radius: 16px;
      width: 350px;
    }
    .search-bar input { background: none; border: none; outline: none; color: var(--text-primary); flex: 1; }
    .search-bar .material-icons { color: var(--text-secondary); }

    .templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    .template-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 20px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .template-card:hover {
      transform: translateY(-8px);
      border-color: var(--accent);
      box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }

    .template-preview {
      height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    .template-preview .material-icons { font-size: 4rem; }

    .template-info { padding: 1.5rem; }
    .template-info h3 { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    .template-info p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem; line-height: 1.5; }

    .template-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--border);
    }
    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      background: var(--bg-primary);
      border-radius: 20px;
      color: var(--text-secondary);
    }

    .btn-import {
      background: var(--accent);
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-import:hover { filter: brightness(1.1); }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 5rem;
      color: var(--text-secondary);
    }
    .empty-state .material-icons { font-size: 4rem; opacity: 0.2; margin-bottom: 1rem; }
  `]
})
export class TemplatesComponent implements OnInit {
  private service = inject(FormBuilderService);
  private projectService = inject(ProjectService);
  private router = inject(Router);

  searchQuery = signal('');
  templates = signal<any[]>([]);

  filteredTemplates = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.templates().filter(t => 
      t.name.toLowerCase().includes(query) || 
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  async ngOnInit() {
    // In a real app, this would be an API call
    // For now, we'll use some high-quality sample templates
    this.templates.set([
      { id: 't1', name: 'Customer Feedback', icon: 'forum', color: '#6366f1', schema: { fields: [
        { id: 'f1', type: 'rating', label: 'How would you rate us?' },
        { id: 'f2', type: 'textarea', label: 'What can we improve?' }
      ]}},
      { id: 't2', name: 'Employment Application', icon: 'work', color: '#10b981', schema: { fields: [
        { id: 'f1', type: 'text', label: 'Full Name' },
        { id: 'f2', type: 'email', label: 'Email Address' },
        { id: 'f3', type: 'file', label: 'Resume/CV' }
      ]}},
      { id: 't3', name: 'Event Registration', icon: 'event', color: '#f59e0b', schema: { fields: [
        { id: 'f1', type: 'text', label: 'Event Name' },
        { id: 'f2', type: 'date', label: 'Date' },
        { id: 'f3', type: 'select', label: 'Ticket Type' }
      ]}},
      { id: 't4', name: 'Support Ticket', icon: 'support_agent', color: '#ec4899', schema: { fields: [
        { id: 'f1', type: 'select', label: 'Priority' },
        { id: 'f2', type: 'textarea', label: 'Issue Description' }
      ]}},
      { id: 't5', name: 'Inventory Check', icon: 'inventory_2', color: '#8b5cf6', schema: { fields: [
        { id: 'f1', type: 'text', label: 'Item SKU' },
        { id: 'f2', type: 'number', label: 'Quantity' }
      ]}},
      { id: 't6', name: 'Order Request', icon: 'shopping_cart', color: '#ef4444', schema: { fields: [
        { id: 'f1', type: 'text', label: 'Product Name' },
        { id: 'f2', type: 'number', label: 'Amount' },
        { id: 'f3', type: 'textarea', label: 'Special Instructions' }
      ]}}
    ]);
  }

  private modalService = inject(ModalService);

  async importTemplate(template: any) {
    const activeProject = this.projectService.activeProject();
    if (activeProject) {
      this.service.loadProjectSchema(template.schema);
      await this.modalService.show({
        title: 'Template Imported',
        message: `${template.name} has been imported into your workspace.`,
        type: 'success',
        confirmText: 'Continue Editing'
      });
      this.goBack();
    } else {
      await this.modalService.show({
        title: 'No Workspace Selected',
        message: 'Please select or create a workspace before importing templates.',
        type: 'warning',
        confirmText: 'Go to Dashboard'
      });
      this.router.navigate(['/dashboard']);
    }
  }

  goBack() {
    const activeProject = this.projectService.activeProject();
    if (activeProject) {
      this.router.navigate(['/project', activeProject.id, 'designer']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
