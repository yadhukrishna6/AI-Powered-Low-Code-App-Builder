import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NodeProperty } from '../registry/node-registry';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  selector: 'app-dynamic-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dynamic-property-field">
      <label>{{ property.label }}</label>
      
      <ng-container [ngSwitch]="property.type">
        <!-- Form Picker -->
        <select *ngSwitchCase="'form-picker'" 
                [(ngModel)]="data[property.key]" 
                (ngModelChange)="onChanged()">
          <option value="">-- Select a Form --</option>
          <option *ngFor="let form of projectForms()" [value]="form.id">{{ form.name }}</option>
          <option *ngIf="projectForms().length === 0" disabled>No forms found in project</option>
        </select>

        <!-- Text Input -->
        <input *ngSwitchCase="'text'" 
               type="text" 
               [(ngModel)]="data[property.key]" 
               (ngModelChange)="onChanged()"
               [placeholder]="property.placeholder || ''">

        <!-- Number Input -->
        <input *ngSwitchCase="'number'" 
               type="number" 
               [(ngModel)]="data[property.key]" 
               (ngModelChange)="onChanged()"
               [placeholder]="property.placeholder || ''">

        <!-- Textarea -->
        <textarea *ngSwitchCase="'textarea'" 
                  [(ngModel)]="data[property.key]" 
                  (ngModelChange)="onChanged()"
                  rows="4"
                  [placeholder]="property.placeholder || ''"></textarea>

        <!-- Select -->
        <select *ngSwitchCase="'select'" 
                [(ngModel)]="data[property.key]" 
                (ngModelChange)="onChanged()">
          <option *ngFor="let opt of property.options" [value]="opt">{{ opt | titlecase }}</option>
        </select>

        <!-- Variable Picker (Mocked for now) -->
        <div *ngSwitchCase="'variable-picker'" class="variable-picker">
          <input type="text" [(ngModel)]="data[property.key]" (ngModelChange)="onChanged()" placeholder="{{ '{{variable}}' }}">
          <button class="picker-btn"><span class="material-icons">add_box</span></button>
        </div>

        <!-- Cron Helper -->
        <div *ngSwitchCase="'cron'" class="cron-field">
           <input type="text" [(ngModel)]="data[property.key]" (ngModelChange)="onChanged()" placeholder="0 0 * * *">
           <span class="help-text">Standard cron expression</span>
        </div>

        <!-- Switch Cases -->
        <div *ngSwitchCase="'switch-cases'" class="switch-cases">
           <div *ngFor="let c of data[property.key]; let i = index" class="case-item">
             <input type="text" [(ngModel)]="c.value" (ngModelChange)="onChanged()" placeholder="Value">
             <button (click)="removeRow(property.key, i)" class="remove-btn"><span class="material-icons">close</span></button>
           </div>
           <button (click)="addRow(property.key, { value: '', path: '' })" class="add-btn">+ Add Case</button>
        </div>

        <!-- Multi Condition -->
        <div *ngSwitchCase="'multi-condition'" class="multi-condition">
          <div *ngFor="let cond of data[property.key]; let i = index" class="condition-row">
            <div class="cond-fields">
              <input type="text" [(ngModel)]="cond.field" (ngModelChange)="onChanged()" placeholder="{{ '{{variable}}' }}" class="cond-input">
              <select [(ngModel)]="cond.operator" (ngModelChange)="onChanged()" class="cond-select">
                <option value="==">==</option>
                <option value="!=">!=</option>
                <option value=">">></option>
                <option value="<"><</option>
                <option value="contains">contains</option>
              </select>
              <input type="text" [(ngModel)]="cond.value" (ngModelChange)="onChanged()" placeholder="Value" class="cond-input">
            </div>
            <button (click)="removeRow(property.key, i)" class="remove-btn"><span class="material-icons">delete</span></button>
          </div>
          <button (click)="addRow(property.key, { field: '', operator: '==', value: '' })" class="add-btn">
            <span class="material-icons">add_circle_outline</span>
            Add Condition
          </button>
        </div>
      </ng-container>

      <p class="help-text" *ngIf="property.helpText">{{ property.helpText }}</p>
    </div>
  `,
  styles: [`
    .dynamic-property-field { margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
    
    input, select, textarea {
      width: 100%; padding: 0.75rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.85rem;
      transition: border-color 0.2s;
    }
    input:focus, select:focus, textarea:focus { border-color: var(--accent); outline: none; }

    .variable-picker { display: flex; gap: 8px; }
    .picker-btn { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 0 8px; color: var(--accent); }

    .cron-field .help-text { font-size: 0.65rem; color: var(--text-secondary); margin-top: 4px; display: block; }

    .switch-cases { display: flex; flex-direction: column; gap: 8px; }
    .case-item { display: flex; gap: 8px; }
    .remove-btn { color: #ef4444; padding: 4px; border-radius: 4px; transition: background 0.2s; }
    .remove-btn:hover { background: rgba(239, 68, 68, 0.1); }
    .add-btn { font-size: 0.75rem; color: var(--accent); font-weight: 700; text-align: left; padding: 6px 0; display: flex; align-items: center; gap: 4px; }
    .add-btn .material-icons { font-size: 1.1rem; }

    .multi-condition { display: flex; flex-direction: column; gap: 12px; }
    .condition-row { display: flex; align-items: center; gap: 8px; background: var(--input-bg); padding: 8px; border-radius: 8px; border: 1px solid var(--border); }
    .cond-fields { display: flex; flex: 1; gap: 4px; }
    .cond-input { flex: 1; min-width: 0; padding: 6px 8px !important; font-size: 0.75rem !important; }
    .cond-select { width: 60px !important; padding: 6px 4px !important; font-size: 0.75rem !important; text-align: center; }
  `]
})
export class DynamicPropertyComponent {
  @Input() property!: NodeProperty;
  @Input() data: any = {};
  @Output() change = new EventEmitter<any>();

  projectService = inject(ProjectService);
  projectForms = computed(() => (this.projectService.activeProject() as any)?.forms || []);

  onChanged() {
    this.change.emit(this.data);
  }

  addRow(key: string, defaultObj: any) {
    if (!this.data[key]) this.data[key] = [];
    this.data[key].push({ ...defaultObj });
    this.onChanged();
  }

  removeRow(key: string, index: number) {
    this.data[key].splice(index, 1);
    this.onChanged();
  }
}
