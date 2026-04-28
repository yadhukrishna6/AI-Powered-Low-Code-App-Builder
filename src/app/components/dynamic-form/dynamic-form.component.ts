import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormSchema } from '../../models/form-schema.model';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="dynamic-form">
      <div *ngFor="let field of schema.fields" class="form-field">
        <label [for]="field.name">{{ field.label }}</label>
        <input
          [type]="field.type"
          [id]="field.name"
          [formControlName]="field.name"
          [placeholder]="field.label"
          [required]="field.required"
        />
        <div *ngIf="isFieldInvalid(field.name)" class="error">
          <span *ngIf="form.get(field.name)?.hasError('required')">{{ field.label }} is required.</span>
          <span *ngIf="form.get(field.name)?.hasError('email')">Enter a valid email address.</span>
        </div>
      </div>
      <div class="actions">
        <button type="submit">Submit</button>
      </div>
    </form>
  `,
  styles: [`
    .dynamic-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 720px;
    }
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-field label {
      font-weight: 500;
      color: #333;
    }
    .form-field input {
      padding: 8px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    .form-field input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
    .error {
      color: #f44336;
      font-size: 12px;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .actions button {
      padding: 8px 16px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .actions button:hover {
      background-color: #1565c0;
    }
  `]
})
export class DynamicFormComponent implements OnChanges {
  @Input() schema: FormSchema = { fields: [] };

  form: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema) {
      this.buildForm();
    }
  }

  private buildForm(): void {
  const group: any = {};

  for (const field of this.schema.fields ?? []) {

    const validators = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    group[field.name] = ['', validators];
  }

  this.form = this.fb.group(group);
}

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Dynamic form values:', this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}
