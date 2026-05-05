import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DraggableFieldType } from '../../../../core/models/form.model';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="palette-container">
      <div class="palette-section">
        <h3 class="panel-title">Components</h3>
<<<<<<< HEAD
        
        @for (group of fieldTypes; track group.group) {
          <div class="group-container">
            <div class="group-label">{{ group.group }}</div>
            <div 
              class="palette-list"
              cdkDropList
              [cdkDropListData]="group.items"
              [cdkDropListConnectedTo]="service.allDropListIds()"
              [cdkDropListSortingDisabled]="true"
            >
              @for (field of group.items; track field.type) {
                <div 
                  class="palette-item"
                  [cdkDragData]="field.type"
                  cdkDrag
                >
                  <div class="item-icon-wrapper">
                    <span class="icon">{{ field.icon }}</span>
                  </div>
                  <div class="item-info">
                    <span class="label">{{ field.label }}</span>
                    <span class="sub-label">{{ field.subLabel }}</span>
                  </div>
                  
                  <div *cdkDragPreview class="palette-item-preview">
                    {{ field.label }}
                  </div>
                </div>
              }
=======
        <div 
          class="palette-list"
          cdkDropList
          [cdkDropListData]="fieldTypes"
          [cdkDropListConnectedTo]="['canvas-list']"
          [cdkDropListSortingDisabled]="true"
        >
          @for (field of fieldTypes; track field.type) {
            <div 
              class="palette-item"
              [cdkDragData]="field.type"
              cdkDrag
            >
              <div class="item-icon-wrapper">
                <span class="icon">{{ field.icon }}</span>
              </div>
              <div class="item-info">
                <span class="label">{{ field.label }}</span>
                <span class="sub-label">{{ field.subLabel }}</span>
              </div>
              
              <div *cdkDragPreview class="palette-item-preview">
                {{ field.label }}
              </div>
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
            </div>
          }
        </div>
      </div>

      <div class="saved-forms-section">
        <div class="section-header">
          <h3 class="panel-title">Saved Forms</h3>
          <button class="btn-add" (click)="service.clearCanvas()" title="New Form">+</button>
        </div>
        <div class="forms-list">
          <div class="forms-sub-header">My Forms</div>
          @for (form of savedForms(); track form.id) {
            <div class="form-card" (click)="loadForm(form.id)">
              <div class="form-card-icon">📋</div>
              <div class="form-card-info">
                <span class="form-card-name">{{ form.name }}</span>
                <span class="form-card-meta">{{ form.schema.fields.length }} fields</span>
              </div>
            </div>
          } @empty {
            <p class="empty-msg">No forms saved yet</p>
          }
        </div>
        <button class="btn-view-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          View All Forms
        </button>
      </div>

      <div class="saved-forms-section">
        <div class="section-header">
          <h3 class="panel-title">Saved Forms</h3>
          <button class="btn-add" (click)="service.clearCanvas()" title="New Form">+</button>
        </div>
        <div class="forms-list">
          <div class="forms-sub-header">My Forms</div>
          @for (form of savedForms(); track form.id) {
            <div class="form-card" (click)="loadForm(form.id)">
              <div class="form-card-icon">📋</div>
              <div class="form-card-info">
                <span class="form-card-name">{{ form.name }}</span>
                <span class="form-card-meta">{{ form.schema.fields.length }} fields</span>
              </div>
            </div>
          } @empty {
            <p class="empty-msg">No forms saved yet</p>
          }
        </div>
        <button class="btn-view-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          View All Forms
        </button>
      </div>
    </div>
  `,
  styles: [`
    .palette-container {
      padding: 1.25rem;
      height: 100%;
<<<<<<< HEAD
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 2rem;
      transition: all 0.3s;
=======
      background: white;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .panel-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
<<<<<<< HEAD
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    .group-container {
      margin-bottom: 1.5rem;
    }
    .group-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      opacity: 0.8;
=======
      color: #64748b;
      margin-bottom: 1rem;
      font-weight: 600;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .palette-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .palette-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
<<<<<<< HEAD
      background: var(--bg-secondary);
      border: 1px solid var(--border);
=======
      background: white;
      border: 1px solid #e2e8f0;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      border-radius: 12px;
      cursor: grab;
      transition: all 0.2s ease;
    }
    .palette-item:hover {
<<<<<<< HEAD
      border-color: var(--accent);
      background: var(--input-bg);
      transform: translateY(-1px);
      box-shadow: var(--card-shadow);
=======
      border-color: #8b5cf6;
      background: #f5f3ff;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .item-icon-wrapper {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
<<<<<<< HEAD
      background: var(--bg-primary);
      border-radius: 8px;
      color: var(--accent);
=======
      background: #f8fafc;
      border-radius: 8px;
      color: #8b5cf6;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      font-size: 1.1rem;
    }
    .item-info {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-weight: 600;
      font-size: 0.875rem;
<<<<<<< HEAD
      color: var(--text-primary);
    }
    .sub-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
=======
      color: #1e293b;
    }
    .sub-label {
      font-size: 0.75rem;
      color: #64748b;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .btn-add {
<<<<<<< HEAD
      color: var(--accent);
=======
      color: #8b5cf6;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      font-size: 1.25rem;
      font-weight: 500;
    }
    .forms-sub-header {
      font-size: 0.8rem;
<<<<<<< HEAD
      color: var(--text-secondary);
=======
      color: #64748b;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      margin-bottom: 0.75rem;
    }
    .form-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
<<<<<<< HEAD
      border: 1px solid var(--border);
=======
      border: 1px solid #e2e8f0;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      border-radius: 12px;
      cursor: pointer;
      margin-bottom: 0.5rem;
      transition: all 0.2s;
<<<<<<< HEAD
      background: var(--bg-secondary);
    }
    .form-card:hover {
      background: var(--input-bg);
      border-color: var(--accent);
=======
    }
    .form-card:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .form-card-icon {
      font-size: 1.2rem;
    }
    .form-card-name {
      display: block;
      font-weight: 600;
      font-size: 0.85rem;
<<<<<<< HEAD
      color: var(--text-primary);
    }
    .form-card-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
=======
      color: #1e293b;
    }
    .form-card-meta {
      font-size: 0.75rem;
      color: #64748b;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .btn-view-all {
      width: 100%;
      margin-top: 1rem;
      padding: 0.625rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
<<<<<<< HEAD
      color: var(--text-secondary);
      border: 1px solid var(--border);
=======
      color: #64748b;
      border: 1px solid #e2e8f0;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      border-radius: 10px;
      transition: all 0.2s;
    }
    .btn-view-all:hover {
<<<<<<< HEAD
      background: var(--input-bg);
      color: var(--text-primary);
      border-color: var(--accent);
    }
    .palette-item-preview {
      padding: 0.75rem 1rem;
      background: var(--accent);
=======
      background: #f8fafc;
      color: #0f172a;
    }
    .palette-item-preview {
      padding: 0.75rem 1rem;
      background: #8b5cf6;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      border-radius: 8px;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3);
      pointer-events: none;
    }
  `]
})
export class PaletteComponent implements OnInit {
  service = inject(FormBuilderService);
  savedForms = signal<any[]>([]);

  fieldTypes: any[] = [
<<<<<<< HEAD
    { group: 'Layout', items: [
      { type: 'row', icon: '🔲', label: 'Row', subLabel: '12-column grid container' },
      { type: 'column', icon: '📋', label: 'Column', subLabel: 'Grid cell with span' },
      { type: 'section', icon: '📁', label: 'Section', subLabel: 'Themed container' },
      { type: 'card', icon: '🃏', label: 'Card', subLabel: 'Box with shadow' },
    ]},
    { group: 'Inputs', items: [
      { type: 'text', icon: '📝', label: 'Text Input', subLabel: 'Single line text' },
      { type: 'email', icon: '📧', label: 'Email', subLabel: 'Email validation' },
      { type: 'number', icon: '🔢', label: 'Number', subLabel: 'Numeric input' },
      { type: 'textarea', icon: '🗒️', label: 'Textarea', subLabel: 'Multi-line text' },
      { type: 'select', icon: '🔽', label: 'Select', subLabel: 'Dropdown menu' },
      { type: 'radio', icon: '🔘', label: 'Radio', subLabel: 'Single selection' },
      { type: 'checkbox', icon: '✅', label: 'Checkbox', subLabel: 'Multi selection' },
      { type: 'file', icon: '📁', label: 'File Upload', subLabel: 'Upload files' }
    ]}
=======
    { type: 'text', icon: '📝', label: 'Text Input', subLabel: 'Single line text input' },
    { type: 'email', icon: '📧', label: 'Email', subLabel: 'Email input field' },
    { type: 'date', icon: '📅', label: 'Date', subLabel: 'Date picker field' },
    { type: 'textarea', icon: '🗒️', label: 'Textarea', subLabel: 'Multi line text input' },
    { type: 'select', icon: '🔽', label: 'Select', subLabel: 'Dropdown select' },
    { type: 'checkbox', icon: '✅', label: 'Checkbox', subLabel: 'Checkbox input' },
    { type: 'radio', icon: '🔘', label: 'Radio', subLabel: 'Radio button group' },
    { type: 'number', icon: '🔢', label: 'Number', subLabel: 'Number input' },
    { type: 'file', icon: '📁', label: 'File Upload', subLabel: 'File upload input' }
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
  ];

  async ngOnInit() {
    await this.refreshForms();
  }

  async refreshForms() {
    const forms = await this.service.loadForms();
    this.savedForms.set(forms);
  }

  async loadForm(id: string) {
    await this.service.loadForm(id);
  }
}
