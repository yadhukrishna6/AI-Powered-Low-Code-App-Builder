import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppDesignerService, NavItem } from '../../services/app-designer.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-layout-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="layout-builder" *ngIf="service.layout() as layout">
      <div class="builder-columns">
        <!-- Sidebar Navigation Config -->
        <div class="builder-column">
          <div class="column-header">
            <h3>Sidebar Navigation</h3>
            <button class="btn-sm" (click)="addNavItem('sidebar')">Add Item</button>
          </div>
          
          <div class="nav-items-list">
            <div *ngFor="let item of layout.navigation.sidebar; let i = index" class="nav-editor-item">
               <div class="item-main">
                  <span class="material-icons drag-handle">drag_indicator</span>
                  <input type="text" [(ngModel)]="item.label" (blur)="save()" placeholder="Label">
                  <input type="text" [(ngModel)]="item.icon" (blur)="save()" placeholder="Icon">
                  <select [(ngModel)]="item.route" (change)="save()">
                    <option *ngFor="let page of service.pages()" [value]="page.route">{{ page.name }}</option>
                  </select>
                  <button class="btn-delete" (click)="removeNavItem('sidebar', i)">
                    <span class="material-icons">delete</span>
                  </button>
               </div>
            </div>
          </div>
        </div>

        <!-- App Shell Preview -->
        <div class="builder-column preview-column">
          <div class="column-header">
            <h3>Layout Preview</h3>
          </div>
          
          <div class="shell-preview">
            <aside class="preview-sidebar">
              <div class="preview-logo"></div>
              <div *ngFor="let item of layout.navigation.sidebar" class="preview-nav-item">
                <span class="material-icons">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </div>
            </aside>
            <div class="preview-main">
              <header class="preview-topbar"></header>
              <div class="preview-content">
                <div class="placeholder-card"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .layout-builder { width: 100%; }
    .builder-columns { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    
    .builder-column {
      background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px;
      padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;
    }
    .column-header { display: flex; justify-content: space-between; align-items: center; }
    .column-header h3 { font-size: 1rem; font-weight: 700; margin: 0; }
    
    .nav-editor-item {
      background: var(--bg-primary); border: 1px solid var(--border); border-radius: 12px;
      padding: 0.75rem; margin-bottom: 0.75rem;
    }
    .item-main { display: flex; align-items: center; gap: 0.75rem; }
    .item-main input { background: transparent; border: 1px solid var(--border); border-radius: 4px; padding: 4px 8px; font-size: 0.8rem; }
    .item-main select { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; padding: 4px; font-size: 0.8rem; flex: 1; }
    .drag-handle { color: var(--text-secondary); opacity: 0.5; cursor: grab; }
    .btn-delete { color: #ef4444; opacity: 0.5; }
    .btn-delete:hover { opacity: 1; }

    .btn-sm { font-size: 0.75rem; font-weight: 700; color: var(--accent); padding: 4px 10px; border: 1px solid var(--accent); border-radius: 6px; }

    .preview-column { background: var(--bg-primary); }
    .shell-preview {
      flex: 1; min-height: 400px; display: flex; border: 1px solid var(--border); border-radius: 12px; overflow: hidden;
      background: var(--bg-primary);
    }
    .preview-sidebar { width: 120px; background: var(--bg-secondary); border-right: 1px solid var(--border); padding: 1rem 0.5rem; }
    .preview-logo { height: 20px; width: 40px; background: var(--accent); border-radius: 4px; margin-bottom: 1.5rem; }
    .preview-nav-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.6rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
    .preview-nav-item .material-icons { font-size: 0.8rem; }
    
    .preview-main { flex: 1; display: flex; flex-direction: column; }
    .preview-topbar { height: 30px; background: var(--bg-secondary); border-bottom: 1px solid var(--border); }
    .preview-content { flex: 1; padding: 1rem; }
    .placeholder-card { height: 100%; border: 1px dashed var(--border); border-radius: 8px; }
  `]
})
export class LayoutBuilderComponent {
  service = inject(AppDesignerService);

  save() {
    const layout = this.service.layout();
    if (layout) {
      this.service.saveLayout(layout.projectId, layout);
    }
  }

  addNavItem(section: 'sidebar' | 'topbar') {
    const layout = this.service.layout();
    if (layout) {
      layout.navigation[section].push({ label: 'New Item', route: '/', icon: 'link' });
      this.save();
    }
  }

  removeNavItem(section: 'sidebar' | 'topbar', index: number) {
    const layout = this.service.layout();
    if (layout) {
      layout.navigation[section].splice(index, 1);
      this.save();
    }
  }
}
