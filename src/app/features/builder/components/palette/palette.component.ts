import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { DraggableFieldType } from '../../../../core/models/form.model';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule, RouterModule],
  template: `
    <div class="palette-container thin-scrollbar">
      <div class="palette-section">
        <h3 class="panel-title">Components</h3>
        
        <div 
          class="palette-list"
          cdkDropList
          [cdkDropListData]="fieldTypes"
          [cdkDropListConnectedTo]="['canvas-root']"
          [cdkDropListSortingDisabled]="true"
        >
          @for (field of fieldTypes; track field.type) {
            <div 
              class="palette-item"
              [cdkDragData]="field.type"
              cdkDrag
              cdkDragPreviewContainer="global"
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
        </div>
      </div>

      <div class="saved-forms-section">
        <div class="section-header">
          <h3 class="panel-title">Form Templates</h3>
          <button class="btn-add" (click)="service.clearCanvas()" title="Reset Canvas">
            <span class="material-icons" style="font-size: 1.2rem;">restart_alt</span>
          </button>
        </div>
        <div class="forms-list">
          <div class="forms-sub-header">Shared Library</div>
          @for (form of savedForms(); track form.id) {
            <div class="form-card" (click)="loadForm(form.id)">
              <div class="form-card-icon">
                <span class="material-icons">description</span>
              </div>
              <div class="form-card-info">
                <span class="form-card-name">{{ form.name }}</span>
                <span class="form-card-meta">Click to import into workspace</span>
              </div>
            </div>
          } @empty {
            <div class="empty-msg">
              <span class="material-icons">info_outline</span>
              <p>No templates available in library</p>
            </div>
          }
        </div>
        <button class="btn-view-all" routerLink="/templates">
          <span class="material-icons" style="font-size: 1rem;">apps</span>
          Browse All Templates
        </button>
      </div>
    </div>
  `,
  styles: [`
    .palette-container {
      padding: 1.25rem;
      height: 100%;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 2rem;
      transition: all 0.3s;
      overflow-y: auto;
    }
    .panel-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-weight: 600;
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
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: grab;
      transition: all 0.2s;
    }
    .palette-item:hover {
      border-color: var(--accent);
      transform: translateY(-1px);
    }
    .item-icon-wrapper {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--accent-rgb), 0.08);
      border-radius: 8px;
      font-size: 1.1rem;
    }
    .item-info {
      display: flex;
      flex-direction: column;
    }
    .label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .sub-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .btn-add {
      color: var(--accent);
      font-size: 1.25rem;
      font-weight: 500;
      background: transparent;
      border: none;
      cursor: pointer;
    }
    .forms-sub-header {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 0.75rem;
    }
    .forms-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .form-card:hover {
      border-color: var(--accent);
      background: rgba(var(--accent-rgb), 0.03);
    }
    .form-card-icon { font-size: 1.25rem; }
    .form-card-info {
      display: flex;
      flex-direction: column;
    }
    .form-card-name {
      display: block;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-primary);
    }
    .form-card-meta {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .empty-msg {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-secondary);
      background: var(--bg-primary);
      border: 1px dashed var(--border);
      border-radius: 12px;
      font-size: 0.8rem;
    }
    .empty-msg .material-icons { opacity: 0.3; font-size: 1.5rem; }
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
      color: var(--text-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      transition: all 0.2s;
      background: transparent;
      cursor: pointer;
    }
    .btn-view-all:hover {
      background: var(--input-bg);
      color: var(--text-primary);
      border-color: var(--accent);
    }
    .palette-item-preview {
      padding: 0.75rem 1rem;
      background: var(--accent);
      border-radius: 8px;
      color: white;
      pointer-events: none;
    }
  `]
})
export class PaletteComponent implements OnInit {
  service = inject(FormBuilderService);
  savedForms = signal<any[]>([]);

  fieldTypes: DraggableFieldType[] = [
    // Basic Inputs
    { type: 'text', icon: '📝', label: 'Text Input', subLabel: 'Single line text' },
    { type: 'password', icon: '🔒', label: 'Password', subLabel: 'Secure text entry' },
    { type: 'email', icon: '📧', label: 'Email', subLabel: 'Email validation' },
    { type: 'number', icon: '🔢', label: 'Number', subLabel: 'Numeric input' },
    { type: 'textarea', icon: '🗒️', label: 'Textarea', subLabel: 'Multi-line text' },
    
    // Selection
    { type: 'select', icon: '🔽', label: 'Select', subLabel: 'Dropdown menu' },
    { type: 'radio', icon: '🔘', label: 'Radio', subLabel: 'Single selection' },
    { type: 'checkbox', icon: '✅', label: 'Checkbox', subLabel: 'Multi selection' },
    { type: 'switch', icon: '🎚️', label: 'Switch', subLabel: 'Toggle on/off' },
    
    // Advanced
    { type: 'date', icon: '📅', label: 'Date Picker', subLabel: 'Select a date' },
    { type: 'time', icon: '🕒', label: 'Time Picker', subLabel: 'Select a time' },
    { type: 'slider', icon: '📏', label: 'Slider', subLabel: 'Range selection' },
    { type: 'rating', icon: '⭐', label: 'Rating', subLabel: 'Star rating' },
    { type: 'file', icon: '📁', label: 'File Upload', subLabel: 'Upload files' },
    
    // Content
    { type: 'header', icon: '🏷️', label: 'Header', subLabel: 'Title text' },
    { type: 'paragraph', icon: '📄', label: 'Paragraph', subLabel: 'Descriptive text' }
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
