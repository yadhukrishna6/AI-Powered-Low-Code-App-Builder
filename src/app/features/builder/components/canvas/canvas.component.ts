import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilderService } from '../../../../core/services/form-builder.service';
import { FieldType } from '../../../../core/models/form.model';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="canvas-container">
      <div class="canvas-header">
        <h2 class="canvas-title">Form Canvas</h2>
        <button class="btn-primary" (click)="saveSchema()">Save Schema</button>
      </div>

      <div 
        id="canvas-list"
        class="canvas-drop-zone"
        cdkDropList
        [cdkDropListData]="service.schema().fields"
        (cdkDropListDropped)="onDrop($event)"
      >
        @if (service.schema().fields.length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📥</span>
            <p>Drag components here to start building your form</p>
          </div>
        }

        @for (field of service.schema().fields; track field.id; let i = $index) {
          <div 
            class="field-wrapper"
            [class.selected]="service.selectedFieldId() === field.id"
            cdkDrag
            (click)="service.selectField(field.id)"
          >
            <div class="field-handle" cdkDragHandle>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="15" cy="15" r="1"/>
              </svg>
            </div>
            
            <div class="field-content">
              <label class="field-label">
                {{ field.label }}
                @if (field.required) { <span class="required">*</span> }
              </label>
              <input 
                [type]="field.type === 'date' ? 'date' : 'text'" 
                class="field-input" 
                [placeholder]="field.placeholder || ''"
                disabled
              >
            </div>

            <button class="btn-delete" (click)="service.removeField(field.id); $event.stopPropagation()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .canvas-container {
      padding: 2rem;
      height: 100%;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .canvas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .canvas-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: white;
    }
    .canvas-drop-zone {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      border: 2px dashed rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      overflow-y: auto;
      min-height: 400px;
    }
    .empty-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.4);
      gap: 1rem;
    }
    .empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }
    .field-wrapper {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      margin-bottom: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .field-wrapper:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .field-wrapper.selected {
      background: rgba(139, 92, 246, 0.1);
      border-color: #8b5cf6;
      box-shadow: 0 0 0 1px #8b5cf6;
    }
    .field-handle {
      cursor: grab;
      color: rgba(255, 255, 255, 0.3);
      padding-top: 0.25rem;
    }
    .field-content {
      flex: 1;
    }
    .field-label {
      display: block;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }
    .required {
      color: #ef4444;
      margin-left: 0.25rem;
    }
    .field-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.625rem;
      color: rgba(255, 255, 255, 0.5);
    }
    .btn-delete {
      padding: 0.5rem;
      border-radius: 6px;
      color: rgba(255, 255, 255, 0.3);
      transition: all 0.2s;
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .btn-primary {
      background: #8b5cf6;
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary:hover {
      background: #7c3aed;
      transform: translateY(-1px);
    }
  `]
})
export class CanvasComponent {
  service = inject(FormBuilderService);

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      // Reordering within the canvas
      this.service.moveField(event.previousIndex, event.currentIndex);
    } else {
      // Dropping from palette
      const fieldType = event.item.data as FieldType;
      this.service.addField(fieldType, event.currentIndex);
    }
  }

  saveSchema() {
    const json = this.service.getSchemaJson();
    console.log('Form Schema Generated:', json);
    alert('Schema logged to console! Check developer tools.');
  }
}
