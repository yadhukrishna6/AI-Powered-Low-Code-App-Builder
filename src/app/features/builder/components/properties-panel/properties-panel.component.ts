import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-properties-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="properties-container">
      <h3 class="panel-title">Properties</h3>
      <p class="panel-subtitle">Select a field to edit its properties</p>

      <div class="tabs">
        <button class="tab-btn active">Field Settings</button>
        <button class="tab-btn">Form Settings</button>
      </div>

      @if (service.selectedField(); as field) {
        <form [formGroup]="propForm" class="prop-form">
          <div class="form-group">
            <label>Field Label</label>
            <input type="text" formControlName="label" placeholder="e.g. First Name">
          </div>

          <div class="form-group">
            <label>Field Name (ID)</label>
            <input type="text" formControlName="name" placeholder="e.g. firstName">
          </div>

          <div class="form-group">
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
        </form>
      } @else {
        <div class="no-selection">
          <div class="empty-illustration">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
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
      padding: 1.5rem;
      height: 100%;
      background: white;
      border-left: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    .panel-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .panel-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 1.5rem;
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 2rem;
    }
    .tab-btn {
      flex: 1;
      padding: 0.75rem 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #94a3b8;
      position: relative;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: #8b5cf6;
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: #8b5cf6;
    }
    .prop-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .form-group label {
      font-size: 0.85rem;
      color: #1e293b;
      font-weight: 600;
    }
    .form-group input {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.75rem;
      color: #1e293b;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: #8b5cf6;
      background: white;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.05);
    }
    .form-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #1e293b;
      font-size: 0.9rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }
    .no-selection {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding-bottom: 4rem;
    }
    .empty-illustration {
      margin-bottom: 1.5rem;
    }
    .no-selection h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    .no-selection p {
      font-size: 0.875rem;
      color: #94a3b8;
    }

    /* Switch toggle styling */
    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #e2e8f0;
      transition: .4s;
      border-radius: 24px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 18px; width: 18px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input:checked + .slider { background-color: #8b5cf6; }
    input:checked + .slider:before { transform: translateX(20px); }
  `]
})
export class PropertiesPanelComponent {
  service = inject(FormBuilderService);
  fb = inject(FormBuilder);
  
  propForm: FormGroup = this.fb.group({
    label: [''],
    name: [''],
    placeholder: [''],
    required: [false]
  });

  constructor() {
    // React to selection changes
    effect(() => {
      const field = this.service.selectedField();
      if (field) {
        this.propForm.patchValue(field, { emitEvent: false });
      }
    });

    // React to form changes
    this.propForm.valueChanges.subscribe(values => {
      const field = this.service.selectedField();
      if (field) {
        this.service.updateField(field.id, values);
      }
    });
  }
}
