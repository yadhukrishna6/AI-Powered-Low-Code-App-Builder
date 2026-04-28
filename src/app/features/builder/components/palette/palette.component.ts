import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DraggableFieldType } from '../../../../core/models/form.model';

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  template: `
    <div class="palette-container">
      <h3 class="panel-title">Components</h3>
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
            <span class="icon">{{ field.icon }}</span>
            <span class="label">{{ field.label }}</span>
            
            <!-- Drag Preview -->
            <div *cdkDragPreview class="palette-item-preview">
              {{ field.label }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .palette-container {
      padding: 1.5rem;
      height: 100%;
      background: rgba(255, 255, 255, 0.03);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    .panel-title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1.5rem;
    }
    .palette-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .palette-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: grab;
      transition: all 0.2s ease;
      color: white;
    }
    .palette-item:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(139, 92, 246, 0.5);
      transform: translateY(-1px);
    }
    .palette-item:active {
      cursor: grabbing;
    }
    .icon {
      font-size: 1.25rem;
    }
    .label {
      font-weight: 500;
      font-size: 0.9rem;
    }
    .palette-item-preview {
      padding: 0.75rem 1rem;
      background: rgba(139, 92, 246, 0.9);
      border-radius: 8px;
      color: white;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      pointer-events: none;
    }
  `]
})
export class PaletteComponent {
  fieldTypes: DraggableFieldType[] = [
    { type: 'text', icon: '📝', label: 'Textbox' },
    { type: 'email', icon: '📧', label: 'Email' },
    { type: 'date', icon: '📅', label: 'Date' }
  ];
}
