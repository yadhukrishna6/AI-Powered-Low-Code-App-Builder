import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDesignerService, AppPage } from '../../services/app-designer.service';
import { ModalService } from '../../../../core/services/modal.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-list-container">
      <div class="list-header">
        <div class="header-text">
          <h2>Application Pages</h2>
          <p>Define the routes and types of pages in your application.</p>
        </div>
        <button class="btn-add" (click)="addPage()">
          <span class="material-icons">add</span>
          Add New Page
        </button>
      </div>

      <div class="pages-grid">
        <div *ngFor="let page of service.pages()" class="page-card">
          <div class="page-icon" [ngClass]="page.type">
            <span class="material-icons">{{ getPageIcon(page.type) }}</span>
          </div>
          <div class="page-info">
            <h3>{{ page.name }}</h3>
            <code>{{ page.route }}</code>
          </div>
          <div class="page-actions">
            <button class="btn-icon" (click)="deletePage(page.id)" title="Delete">
              <span class="material-icons">delete</span>
            </button>
            <button class="btn-icon" title="Edit Properties">
              <span class="material-icons">settings</span>
            </button>
            <button class="btn-view" [routerLink]="['/project', service.layout()?.projectId, 'designer']" title="Open in Designer">
              <span class="material-icons">open_in_new</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-list-container { width: 100%; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .header-text h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
    .header-text p { color: var(--text-secondary); font-size: 0.9rem; }

    .btn-add {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem;
      background: var(--accent); color: var(--bg-primary); border-radius: 12px;
      font-weight: 700; transition: all 0.2s;
    }

    .pages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .page-card {
      background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px;
      padding: 1.25rem; display: flex; align-items: center; gap: 1.25rem; transition: all 0.2s;
    }
    .page-card:hover { transform: translateY(-4px); border-color: var(--accent); box-shadow: var(--card-shadow); }

    .page-icon {
      width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
    }
    .page-icon.crud { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .page-icon.dashboard { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
    .page-icon.form { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .page-icon.custom { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

    .page-info { flex: 1; }
    .page-info h3 { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
    .page-info code { font-size: 0.75rem; color: var(--accent); background: var(--input-bg); padding: 2px 6px; border-radius: 4px; }

    .page-actions { display: flex; gap: 0.25rem; }
    .btn-icon { color: var(--text-secondary); padding: 6px; border-radius: 8px; }
    .btn-icon:hover { background: var(--input-bg); color: var(--text-primary); }
    .btn-view { color: var(--accent); padding: 6px; border-radius: 8px; }
  `]
})
export class PageListComponent {
  service = inject(AppDesignerService);
  modal = inject(ModalService);

  getPageIcon(type: string) {
    switch (type) {
      case 'crud': return 'list_alt';
      case 'dashboard': return 'dashboard';
      case 'form': return 'assignment';
      default: return 'article';
    }
  }

  async addPage() {
    const action = await this.modal.show({
      title: 'Add Content',
      message: 'Would you like to create a custom page or generate CRUD from an existing entity?',
      type: 'prompt',
      placeholder: 'Type "custom" or "crud"',
      initialValue: 'crud',
      confirmText: 'Continue'
    });

    if (action === 'crud') {
      const entityName = await this.modal.show({
        title: 'Generate CRUD',
        message: 'Enter the name of the Entity you want to build UI for.',
        type: 'prompt',
        placeholder: 'e.g. Employee',
        confirmText: 'Generate UI'
      });
      
      if (entityName) {
        // Trigger backend generator
        console.log('Generating CRUD for', entityName);
      }
    } else if (action === 'custom') {
       // Old manual logic...
    }
  }

  async deletePage(id: string) {
    if (confirm('Are you sure you want to delete this page?')) {
      await this.service.deletePage(id);
    }
  }
}
