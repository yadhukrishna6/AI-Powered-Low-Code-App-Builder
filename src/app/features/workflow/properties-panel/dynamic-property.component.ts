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
             <button (click)="removeCase(i)" class="remove-btn"><span class="material-icons">close</span></button>
           </div>
           <button (click)="addCase()" class="add-btn">+ Add Case</button>
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
    .remove-btn { color: #ef4444; }
    .add-btn { font-size: 0.75rem; color: var(--accent); font-weight: 700; text-align: left; padding: 4px 0; }
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

  addCase() {
    if (!this.data[this.property.key]) this.data[this.property.key] = [];
    this.data[this.property.key].push({ value: '', path: '' });
    this.onChanged();
  }

  removeCase(index: number) {
    this.data[this.property.key].splice(index, 1);
    this.onChanged();
  }
}
