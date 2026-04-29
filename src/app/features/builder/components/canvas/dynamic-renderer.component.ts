import { Component, Input, inject, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormField, FieldType } from '../../../../core/models/form.model';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-dynamic-renderer',
  standalone: true,
  imports: [CommonModule, DragDropModule, forwardRef(() => DynamicRendererComponent)],
  template: `
    <div 
      [id]="field.id"
      class="renderer-container"
      [class.selected]="service.selectedFieldId() === field.id"
      [class.layout-component]="isLayoutComponent(field.type)"
      (click)="selectField($event)"
      cdkDrag
      [cdkDragData]="field"
    >
      <!-- Drag Handle & Actions (Only for non-root) -->
      <div class="renderer-header" *ngIf="field.type !== 'column'">
        <div class="drag-handle" cdkDragHandle>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="15" cy="15" r="1"/>
          </svg>
        </div>
        <div class="field-info">
          <span class="type-badge">{{ field.type }}</span>
        </div>
        <div class="actions">
          <button (click)="duplicateField($event)" class="action-btn" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button (click)="removeField($event)" class="action-btn delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="renderer-body" [ngSwitch]="field.type">
        
        <!-- Layout: Row -->
        <div *ngSwitchCase="'row'" class="row-layout grid-12" 
             cdkDropList 
             [cdkDropListData]="field.children"
             [id]="field.id + '-list'"
             [cdkDropListConnectedTo]="service.allDropListIds()"
             (cdkDropListDropped)="onDrop($event)">
          <app-dynamic-renderer 
            *ngFor="let child of field.children" 
            [field]="child"
            [parentId]="field.id">
          </app-dynamic-renderer>
          
          <div class="empty-layout-placeholder" *ngIf="field.children?.length === 0">
            Drop columns here
          </div>
        </div>

        <!-- Layout: Column -->
        <div *ngSwitchCase="'column'" 
             class="column-layout" 
             [style.grid-column]="'span ' + (field.layout?.span || 12)"
             cdkDropList 
             [cdkDropListData]="field.children"
             [id]="field.id + '-list'"
             [cdkDropListConnectedTo]="service.allDropListIds()"
             (cdkDropListDropped)="onDrop($event)">
          <div class="column-header">
            <div class="drag-handle small" cdkDragHandle>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="15" cy="15" r="1"/>
              </svg>
            </div>
            <span class="span-info">Span: {{ field.layout?.span || 12 }}/12</span>
          </div>
          <app-dynamic-renderer 
            *ngFor="let child of field.children" 
            [field]="child"
            [parentId]="field.id">
          </app-dynamic-renderer>
          
          <div class="empty-layout-placeholder" *ngIf="field.children?.length === 0">
            Drop components here
          </div>
        </div>

        <!-- Layout: Card -->
        <div *ngSwitchCase="'card'" class="card-layout">
          <div class="card-header">{{ field.label }}</div>
          <div class="card-content"
               cdkDropList 
               [cdkDropListData]="field.children"
               [id]="field.id + '-list'"
               [cdkDropListConnectedTo]="service.allDropListIds()"
               (cdkDropListDropped)="onDrop($event)">
            <app-dynamic-renderer 
              *ngFor="let child of field.children" 
              [field]="child"
              [parentId]="field.id">
            </app-dynamic-renderer>
          </div>
        </div>

        <!-- Inputs -->
        <div *ngSwitchDefault class="input-element">
          <label class="field-label">
            {{ field.label }}
            <span *ngIf="field.required" class="required">*</span>
          </label>
          
          <ng-container [ngSwitch]="field.type">
            <input *ngSwitchCase="'text'" type="text" [placeholder]="field.placeholder" class="form-input" disabled>
            <input *ngSwitchCase="'email'" type="email" [placeholder]="field.placeholder" class="form-input" disabled>
            <input *ngSwitchCase="'number'" type="number" [placeholder]="field.placeholder" class="form-input" disabled>
            <textarea *ngSwitchCase="'textarea'" [placeholder]="field.placeholder" class="form-input" disabled></textarea>
            
            <select *ngSwitchCase="'select'" class="form-input" disabled>
              <option *ngFor="let opt of field.props?.options">{{ opt }}</option>
            </select>

            <div *ngSwitchCase="'radio'" class="options-group">
              <div *ngFor="let opt of field.props?.options" class="option-item">
                <input type="radio" disabled> <span>{{ opt }}</span>
              </div>
            </div>

            <div *ngSwitchCase="'checkbox'" class="option-item">
              <input type="checkbox" disabled> <span>{{ field.label }}</span>
            </div>

            <div *ngSwitchCase="'file'" class="file-upload-preview">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <span>Click or drag file to upload</span>
            </div>
          </ng-container>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .renderer-container {
      position: relative;
      border: 1px solid transparent;
      border-radius: 8px;
      transition: all 0.2s;
      margin-bottom: 0.5rem;
    }
    .renderer-container:hover {
      border-color: var(--accent);
      background: rgba(139, 92, 246, 0.02);
    }
    .renderer-container.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
      background: rgba(139, 92, 246, 0.05);
    }
    .renderer-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 4px 8px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      border-radius: 8px 8px 0 0;
      opacity: 0;
      transition: opacity 0.2s;
      position: absolute;
      top: -28px;
      left: 0;
      z-index: 10;
    }
    .renderer-container:hover > .renderer-header,
    .renderer-container.selected > .renderer-header {
      opacity: 1;
    }
    .drag-handle {
      cursor: grab;
      color: var(--text-secondary);
    }
    .type-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--accent);
      background: rgba(139, 92, 246, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .action-btn {
      color: var(--text-secondary);
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent);
    }
    .action-btn.delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .renderer-body {
      padding: 0.75rem;
    }

    /* Layout Styles */
    .grid-12 {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem;
    }
    .row-layout {
      min-height: 80px;
      border: 1px dashed var(--border);
      border-radius: 8px;
      padding: 1rem;
      background: rgba(0,0,0,0.02);
    }
    .column-layout {
      min-height: 60px;
      border: 1px dashed var(--border);
      border-radius: 6px;
      padding: 0.5rem;
      background: transparent;
      transition: all 0.2s ease;
    }
    .column-header {
      font-size: 0.7rem;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2px;
    }
    .card-layout {
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--bg-primary);
      overflow: hidden;
      box-shadow: var(--card-shadow);
      transition: all 0.2s ease;
    }
    .card-header {
      padding: 0.75rem 1rem;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
      font-weight: 600;
    }
    .card-content {
      padding: 1rem;
      min-height: 60px;
      background: transparent;
      transition: all 0.2s ease;
    }

    .empty-layout-placeholder {
      grid-column: span 12;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-style: italic;
      border: 1px dashed var(--border);
      border-radius: 4px;
    }

    /* Input Styles */
    .field-label {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .required { color: #ef4444; margin-left: 2px; }
    .form-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--input-bg);
      font-size: 0.9rem;
    }
    .options-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .option-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    .file-upload-preview {
      border: 2px dashed var(--border);
      border-radius: 10px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }
  `]
})
export class DynamicRendererComponent {
  @Input() field!: FormField;
  @Input() parentId: string | null = null;

  service = inject(FormBuilderService);

  isLayoutComponent(type: FieldType): boolean {
    return ['row', 'column', 'section', 'card'].includes(type);
  }

  selectField(event: MouseEvent) {
    event.stopPropagation();
    this.service.selectField(this.field.id);
  }

  removeField(event: MouseEvent) {
    event.stopPropagation();
    this.service.removeField(this.field.id);
  }

  duplicateField(event: MouseEvent) {
    event.stopPropagation();
    this.service.duplicateField(this.field.id);
  }

  onDrop(event: CdkDragDrop<any>) {
    console.log('Renderer Drop:', { 
      targetFieldId: this.field.id, 
      previousParentId: event.previousContainer.id,
      containerId: event.container.id 
    });

    if (event.previousContainer === event.container) {
      this.service.moveField(event.previousIndex, event.currentIndex, this.field.id, this.field.id);
    } else {
      const fieldData = event.item.data;
      if (typeof fieldData === 'string') {
        // From palette
        this.service.addField(fieldData as FieldType, this.field.id, event.currentIndex);
      } else {
        // Moving from another container
        const previousParentId = event.previousContainer.id === 'canvas-root' ? null : event.previousContainer.id.replace('-list', '');
        this.service.moveField(event.previousIndex, event.currentIndex, previousParentId, this.field.id);
      }
    }
  }
}
