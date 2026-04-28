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
          <p>Select a field on the canvas to edit its properties</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .properties-container {
      padding: 1.5rem;
      height: 100%;
      background: rgba(255, 255, 255, 0.03);
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      width: 300px;
    }
    .panel-title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1.5rem;
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
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
    .form-group input {
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 0.625rem;
      color: white;
      font-size: 0.9rem;
    }
    .form-group input:focus {
      outline: none;
      border-color: #8b5cf6;
      background: rgba(0, 0, 0, 0.3);
    }
    .form-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
    .no-selection {
      height: calc(100% - 4rem);
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.9rem;
      padding: 2rem;
    }

    /* Switch toggle styling */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(255, 255, 255, 0.1);
      transition: .4s;
      border-radius: 20px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px; width: 14px;
      left: 3px; bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
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
