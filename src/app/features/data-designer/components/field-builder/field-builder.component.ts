import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataDesignerService, FieldMetadata } from '../../services/data-designer.service';

@Component({
  selector: 'app-field-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="field-builder-container" *ngIf="service.activeField() as field">
      <div class="builder-header">
        <span class="material-icons">settings_input_component</span>
        <h3>Field Settings: {{ field.name }}</h3>
      </div>

      <div class="builder-sections thin-scrollbar">
        <!-- Basic Info -->
        <section class="config-section">
          <label>General</label>
          <div class="input-group">
            <span class="label">Field Name</span>
            <input type="text" [(ngModel)]="field.name" (change)="update()">
          </div>
          <div class="input-group">
            <span class="label">Display Label</span>
            <input type="text" [(ngModel)]="field.label" (change)="update()">
          </div>
          <div class="input-group">
            <span class="label">Data Type</span>
            <select [(ngModel)]="field.type" (change)="update()">
              <optgroup label="Standard">
                <option value="Text">Text</option>
                <option value="LongText">Long Text</option>
                <option value="Number">Number</option>
                <option value="Boolean">Boolean</option>
                <option value="DateTime">Date Time</option>
              </optgroup>
              <optgroup label="Advanced">
                <option value="RichText">Rich Text</option>
                <option value="JSON">JSON</option>
                <option value="UUID">UUID</option>
              </optgroup>
            </select>
          </div>
        </section>

        <!-- Constraints -->
        <section class="config-section">
          <label>Constraints</label>
          <div class="toggle-group">
            <div class="toggle-item">
              <span>Required</span>
              <input type="checkbox" [(ngModel)]="field.isRequired" (change)="update()">
            </div>
            <div class="toggle-item">
              <span>Unique</span>
              <input type="checkbox" [(ngModel)]="field.isUnique" (change)="update()">
            </div>
            <div class="toggle-item">
              <span>Indexed</span>
              <input type="checkbox" [(ngModel)]="field.isIndexed" (change)="update()">
            </div>
          </div>
        </section>

        <!-- Validations -->
        <section class="config-section">
          <label>Validation Rules</label>
          <div class="validation-list" *ngIf="field.type === 'Text' || field.type === 'LongText'">
             <div class="input-group">
                <span class="label">Min Length</span>
                <input type="number" [(ngModel)]="field.validations.minLength" (change)="update()">
             </div>
             <div class="input-group">
                <span class="label">Max Length</span>
                <input type="number" [(ngModel)]="field.validations.maxLength" (change)="update()">
             </div>
             <div class="input-group">
                <span class="label">Regex Pattern</span>
                <input type="text" [(ngModel)]="field.validations.pattern" (change)="update()">
             </div>
          </div>
        </section>
      </div>

      <div class="builder-footer">
        <button class="btn-delete" (click)="deleteField()">
          <span class="material-icons">delete</span>
          Delete Field
        </button>
      </div>
    </div>

    <div class="empty-state" *ngIf="!service.activeField()">
      <span class="material-icons">mouse</span>
      <p>Select a field to configure its properties</p>
    </div>
  `,
  styles: [`
    .field-builder-container { height: 100%; display: flex; flex-direction: column; background: var(--bg-secondary); }
    .builder-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.75rem; color: var(--accent); }
    .builder-header h3 { font-size: 0.9rem; font-weight: 700; margin: 0; color: var(--text-primary); }

    .builder-sections { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 2rem; }
    
    .config-section { display: flex; flex-direction: column; gap: 1rem; }
    .config-section label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.05em; }

    .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .input-group .label { font-size: 0.8rem; color: var(--text-secondary); }
    .input-group input, .input-group select {
      background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px;
      padding: 0.6rem 0.8rem; color: var(--text-primary); font-size: 0.85rem;
    }

    .toggle-group { display: flex; flex-direction: column; gap: 0.75rem; background: var(--input-bg); padding: 1rem; border-radius: 12px; }
    .toggle-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }

    .builder-footer { padding: 1.5rem; border-top: 1px solid var(--border); }
    .btn-delete {
      width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      padding: 0.75rem; border-radius: 10px; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);
      font-weight: 600; font-size: 0.85rem; transition: all 0.2s;
    }
    .btn-delete:hover { background: rgba(239, 68, 68, 0.05); }

    .empty-state {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: var(--text-secondary); opacity: 0.5; padding: 3rem; text-align: center;
    }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; }
  `]
})
export class FieldBuilderComponent {
  service = inject(DataDesignerService);

  update() {
    const field = this.service.activeField();
    const entityId = this.service.selectedEntityId();
    if (field && entityId) {
      this.service.updateField(entityId, field);
    }
  }

  deleteField() {
    // Implement delete logic...
  }
}
