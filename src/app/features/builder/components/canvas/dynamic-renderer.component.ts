import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormField, FieldType } from '../../../../core/models/form.model';
import { FormsModule } from '@angular/forms';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-dynamic-renderer',
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  host: {
    '[style.grid-column]': "'span ' + (field.layout?.span || 12)",
    '[hidden]': "!isVisible()"
  },
  template: `
    <div 
      *ngIf="isVisible()"
      [id]="field.id"
      class="field-card"
      [class.selected]="service.selectedField()?.id === field.id"
      (click)="selectField($event)"
      cdkDrag
      [cdkDragData]="field"
    >
      <!-- ... existing content ... -->
      <!-- Drag Preview -->
      <div *cdkDragPreview class="drag-preview">
        <span>{{ field.label }}</span>
      </div>

      <!-- Card Body -->
      <div class="card-body">
        <div class="field-preview" [ngSwitch]="field.type">

          <!-- Text / Email / Number -->
          <div *ngSwitchCase="'text'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <input 
              type="text" 
              [placeholder]="field.placeholder || ''" 
              [disabled]="!isRuntime" 
              [(ngModel)]="field.defaultValue"
              (ngModelChange)="onValueChange($event)"
              class="preview-input"
            >
          </div>

          <div *ngSwitchCase="'select'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <select 
              [disabled]="!isRuntime" 
              [(ngModel)]="field.defaultValue"
              (ngModelChange)="onValueChange($event)"
              class="preview-input"
            >
              <option value="" disabled>{{ field.placeholder || 'Select an option...' }}</option>
              <option *ngFor="let opt of field.props?.options || field.options" [value]="opt">{{ opt }}</option>
            </select>
          </div>

          <div *ngSwitchCase="'date'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <input 
              type="date" 
              [disabled]="!isRuntime" 
              [(ngModel)]="field.defaultValue"
              (ngModelChange)="onValueChange($event)"
              class="preview-input"
            >
          </div>

          <div *ngSwitchCase="'number'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <input 
              type="number" 
              [placeholder]="field.placeholder || ''" 
              [disabled]="!isRuntime || field.readonly" 
              [(ngModel)]="field.defaultValue"
              (ngModelChange)="onValueChange($event)"
              class="preview-input"
            >
          </div>

          <div *ngSwitchCase="'textarea'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <textarea 
              [placeholder]="field.placeholder || ''" 
              [disabled]="!isRuntime" 
              [(ngModel)]="field.defaultValue"
              (ngModelChange)="onValueChange($event)"
              class="preview-input preview-textarea"
            ></textarea>
          </div>

          <div *ngSwitchCase="'time'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <input type="time" disabled class="preview-input">
          </div>

          <div *ngSwitchCase="'switch'" class="preview-group">
            <div class="switch-preview">
              <label class="preview-label">{{ field.label }}</label>
              <div class="toggle-switch"></div>
            </div>
          </div>

          <div *ngSwitchCase="'slider'" class="preview-group">
            <label class="preview-label">{{ field.label }}</label>
            <div class="slider-preview">
              <input type="range" disabled class="preview-range">
              <div class="range-values"><span>0</span><span>100</span></div>
            </div>
          </div>

          <div *ngSwitchCase="'rating'" class="preview-group">
            <label class="preview-label">{{ field.label }}</label>
            <div class="stars-preview">
              <span *ngFor="let i of [1,2,3,4,5]">⭐</span>
            </div>
          </div>

          <div *ngSwitchCase="'header'" class="preview-group">
            <h2 class="header-preview">{{ field.label }}</h2>
          </div>

          <div *ngSwitchCase="'paragraph'" class="preview-group">
            <p class="para-preview">{{ field.placeholder || 'Your descriptive text goes here...' }}</p>
          </div>

          <!-- File Upload -->
          <div *ngSwitchCase="'file'" class="preview-group">
            <label class="preview-label">{{ field.label }} <span *ngIf="field.required" class="req">*</span></label>
            <div class="file-zone">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>
              </svg>
              <span>Click or drag file to upload</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer: Drag + Actions -->
      <div class="card-footer">
        <div class="footer-left">
          <div class="drag-handle" cdkDragHandle title="Drag to reorder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
        </div>
        <div class="footer-actions">
          <button class="footer-btn" (click)="duplicateField($event)" title="Duplicate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
          </button>
          <button class="footer-btn delete" (click)="removeField($event)" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ─── Card Shell ─── */
    .field-card {
      background: var(--bg-primary, #fff);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .field-card:hover {
      border-color: var(--accent);
    }
    .field-card.selected {
    }

    /* ─── Card Body ─── */
    .card-body {
      padding: 1rem 1.25rem;
    }

    .preview-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .preview-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary, #1f2937);
    }
    .req { color: #ef4444; margin-left: 2px; }

    .preview-input {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border, #e5e7eb);
      border-radius: 8px;
      background: var(--input-bg, #f9fafb);
      font-size: 0.85rem;
      color: var(--text-secondary, #6b7280);
      box-sizing: border-box;
    }
    .preview-textarea {
      min-height: 60px;
      resize: none;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .radio-item, .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-primary, #1f2937);
      cursor: default;
    }

    .password-wrapper { position: relative; }
    .pw-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); opacity: 0.5; font-size: 0.9rem; }

    .switch-preview { display: flex; justify-content: space-between; align-items: center; }
    .toggle-switch { width: 40px; height: 20px; background: var(--border); border-radius: 20px; position: relative; }
    .toggle-switch::after { content: ''; position: absolute; left: 3px; top: 3px; width: 14px; height: 14px; background: white; border-radius: 50%; }

    .slider-preview { display: flex; flex-direction: column; gap: 0.5rem; }
    .preview-range { width: 100%; accent-color: var(--accent); }
    .range-values { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-secondary); }

    .stars-preview { display: flex; gap: 4px; font-size: 1.1rem; }

    .header-preview { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .para-preview { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin: 0; }

    .file-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem;
      border: 2px dashed var(--border, #d1d5db);
      border-radius: 10px;
      color: var(--text-secondary, #9ca3af);
      font-size: 0.8rem;
    }

    /* ─── Footer ─── */
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0.75rem;
      background: var(--bg-secondary, #f9fafb);
      border-top: 1px solid var(--border, #e5e7eb);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    .field-card:hover > .card-footer,
    .field-card.selected > .card-footer {
      opacity: 1;
    }

    .footer-left {
      display: flex;
      align-items: center;
    }
    .drag-handle {
      cursor: grab;
      color: var(--text-secondary, #9ca3af);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .drag-handle:hover {
      background: var(--border, #e5e7eb);
      color: var(--text-primary, #1f2937);
    }

    .footer-actions {
      display: flex;
      gap: 2px;
    }
    .footer-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      border: none;
      background: transparent;
      border-radius: 4px;
      color: var(--text-secondary, #9ca3af);
      cursor: pointer;
      transition: all 0.15s;
    }
    .footer-btn:hover {
      background: rgba(var(--accent-rgb), 0.1);
      color: var(--accent, #000000);
    }
    .footer-btn.delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* ─── Drag Preview ─── */
    .drag-preview {
      padding: 0.5rem 1rem;
      background: var(--accent, #000000);
      color: white;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
    }
  `]
})
export class DynamicRendererComponent {
  @Input() field!: FormField;
  @Input() isRuntime = false;
  @Input() formValues: Record<string, any> = {};
  @Output() fieldChange = new EventEmitter<{ fieldId: string, value: any }>();

  service = inject(FormBuilderService);

  isVisible = computed(() => {
    const rules = this.field.visibilityRules;
    if (!rules || rules.length === 0) return true;
    
    return rules.every(rule => {
      const value = this.formValues[rule.fieldId];
      switch (rule.operator) {
        case '==': return value == rule.value;
        case '!=': return value != rule.value;
        case 'contains': return String(value || '').includes(String(rule.value || ''));
        case 'empty': return !value || (Array.isArray(value) && value.length === 0);
        case 'not_empty': return !!value && (!Array.isArray(value) || value.length > 0);
        default: return true;
      }
    });
  });

  onValueChange(value: any) {
    this.fieldChange.emit({ fieldId: this.field.id, value });
  }

  selectField(event: MouseEvent) {
    if (this.isRuntime) return;
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
}
