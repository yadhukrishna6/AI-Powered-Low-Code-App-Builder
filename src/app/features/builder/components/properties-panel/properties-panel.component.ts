import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilderService } from '../../../../core/services/form-builder.service';
import { OptionsEditorComponent } from './controls/options-editor.component';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OptionsEditorComponent],
  template: `
    <div class="properties-container">
      @if (service.selectedField(); as field) {
        <div class="panel-header">
          <div class="type-header">
            <span class="type-label">{{ field.type }}</span>
            <span class="id-label">#{{ field.id.slice(0, 8) }}</span>
          </div>
          
          <div class="tabs-nav">
            <button [class.active]="activeTab === 'general'" (click)="activeTab = 'general'">General</button>
            <button [class.active]="activeTab === 'validation'" (click)="activeTab = 'validation'">Validation</button>
            <button [class.active]="activeTab === 'logic'" (click)="activeTab = 'logic'">Logic</button>
          </div>
        </div>

        <div class="panel-content" [formGroup]="propForm">
          @if (activeTab === 'general') {
            <div class="tab-pane">
              <div class="form-group">
                <label>Field Label</label>
                <input type="text" formControlName="label" placeholder="Enter label...">
              </div>

              <div class="form-group">
                <label>Field Name (ID)</label>
                <input type="text" formControlName="name" placeholder="field_name">
              </div>

              <div class="form-group" *ngIf="hasPlaceholder(field.type)">
                <label>Placeholder</label>
                <input type="text" formControlName="placeholder" placeholder="Enter placeholder...">
              </div>

              <div class="form-toggle">
                <span>Required Field</span>
                <label class="switch">
                  <input type="checkbox" formControlName="required">
                  <span class="slider"></span>
                </label>
              </div>

              <div class="form-group">
                <label>Width ({{ propForm.get('span')?.value }}/12)</label>
                <div class="grid-slider">
                  <input type="range" formControlName="span" min="1" max="12" class="range-input">
                  <span class="span-value">{{ propForm.get('span')?.value }}</span>
                </div>
              </div>

              @if (['select', 'radio'].includes(field.type)) {
                <div class="form-group">
                  <label>Options</label>
                  <app-options-editor 
                    [options]="field.props?.options || []"
                    (optionsChange)="updateOptions($event)">
                  </app-options-editor>
                </div>
              }
            </div>
          }

          @if (activeTab === 'validation') {
            <div class="tab-pane" formGroupName="validation">
              <div class="form-group" *ngIf="['text', 'password', 'textarea'].includes(field.type)">
                <label>Min Length</label>
                <input type="number" formControlName="minLength" placeholder="e.g. 3">
              </div>

              <div class="form-group" *ngIf="['text', 'password', 'textarea'].includes(field.type)">
                <label>Max Length</label>
                <input type="number" formControlName="maxLength" placeholder="e.g. 50">
              </div>

              <div class="form-group" *ngIf="['number', 'slider', 'rating'].includes(field.type)">
                <label>Min Value</label>
                <input type="number" formControlName="min" placeholder="e.g. 0">
              </div>

              <div class="form-group" *ngIf="['number', 'slider', 'rating'].includes(field.type)">
                <label>Max Value</label>
                <input type="number" formControlName="max" placeholder="e.g. 100">
              </div>

              <div class="form-group" *ngIf="['text', 'email', 'password'].includes(field.type)">
                <label>Pattern (Regex)</label>
                <input type="text" formControlName="pattern" placeholder="e.g. [a-z]+">
              </div>
            </div>
          }

          @if (activeTab === 'logic') {
            <div class="tab-pane">
              <div class="logic-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <p>Conditional logic and advanced rules coming soon.</p>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-selection">
          <div class="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
              <path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-9h4m4 11h4"/>
            </svg>
          </div>
          <h3>Select a field on the canvas</h3>
          <p>to edit its properties</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .properties-container {
      height: 100%;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    /* ─── Header ─── */
    .panel-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      background: var(--bg-primary);
    }
    .type-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .type-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--accent);
      background: rgba(var(--accent-rgb), 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .id-label {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-family: monospace;
    }

    /* ─── Tabs ─── */
    .tabs-nav {
      display: flex;
      background: var(--input-bg);
      padding: 4px;
      border-radius: 8px;
      gap: 4px;
    }
    .tabs-nav button {
      flex: 1;
      padding: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tabs-nav button:hover { color: var(--text-primary); }
    .tabs-nav button.active {
      background: var(--bg-primary);
      color: var(--accent);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    /* ─── Content ─── */
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }
    .tab-pane {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.3s ease-out;
    }

    /* ─── Form Controls ─── */
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-group label {
      font-size: 0.85rem;
      color: var(--text-primary);
      font-weight: 600;
    }
    .form-group input:not([type="range"]):not([type="checkbox"]) {
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem;
      color: var(--text-primary);
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: var(--accent);
    }

    .grid-slider {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .range-input {
      flex: 1;
      accent-color: var(--accent);
    }
    .span-value {
      font-weight: 700;
      color: var(--accent);
      font-size: 1rem;
      width: 20px;
    }

    .form-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-primary);
      font-size: 0.9rem;
      font-weight: 500;
    }

    /* ─── Logic Placeholder ─── */
    .logic-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      text-align: center;
      color: var(--text-secondary);
      gap: 1rem;
      opacity: 0.7;
    }
    .logic-placeholder p {
      font-size: 0.85rem;
      max-width: 200px;
    }

    /* ─── Empty State ─── */
    .no-selection {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }
    .empty-illustration {
      margin-bottom: 1.5rem;
      color: var(--accent);
    }
    .no-selection h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }
    .no-selection p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      opacity: 0.7;
    }

    /* ─── Toggle Switch ─── */
    .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--border);
      transition: .4s; border-radius: 24px;
    }
    .slider:before {
      position: absolute; content: "";
      height: 18px; width: 18px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .4s; border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input:checked + .slider { background-color: var(--accent); }
    input:checked + .slider:before { transform: translateX(20px); }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class PropertiesPanelComponent {
  service = inject(FormBuilderService);
  fb = inject(FormBuilder);
  
  activeTab: 'general' | 'validation' | 'logic' = 'general';
  propForm: FormGroup;

  constructor() {
    this.propForm = this.fb.group({
      label: [''],
      name: [''],
      placeholder: [''],
      required: [false],
      span: [12],
      validation: this.fb.group({
        minLength: [null],
        maxLength: [null],
        min: [null],
        max: [null],
        pattern: ['']
      })
    });

    effect(() => {
      const field = this.service.selectedField();
      if (field) {
        this.propForm.patchValue({
          label: field.label,
          name: field.name,
          placeholder: field.placeholder || '',
          required: field.required,
          span: field.layout?.span || 12,
          validation: {
            minLength: field.validation?.minLength || null,
            maxLength: field.validation?.maxLength || null,
            min: field.validation?.min || null,
            max: field.validation?.max || null,
            pattern: field.validation?.pattern || ''
          }
        }, { emitEvent: false });
      }
    });

    this.propForm.valueChanges.subscribe(values => {
      const field = this.service.selectedField();
      if (field) {
        this.service.updateField(field.id, {
          label: values.label,
          name: values.name,
          placeholder: values.placeholder,
          required: values.required,
          validation: values.validation,
          layout: { span: values.span }
        });
      }
    });
  }

  hasPlaceholder(type: string): boolean {
    return ['text', 'email', 'number', 'textarea', 'password', 'paragraph'].includes(type);
  }

  updateOptions(options: string[]) {
    const field = this.service.selectedField();
    if (field) {
      this.service.updateField(field.id, {
        props: { ...field.props, options }
      });
    }
  }
}
