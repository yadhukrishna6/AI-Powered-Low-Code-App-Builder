import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-options-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="options-editor">
      <label class="section-label">Options</label>
      <div class="options-list">
        <div *ngFor="let opt of options; let i = index; trackBy: trackByFn" class="option-row">
          <input 
            type="text" 
            [(ngModel)]="options[i]" 
            (ngModelChange)="onOptionChange()"
            [placeholder]="'Option ' + (i + 1)"
            class="option-input"
          >
          <button (click)="removeOption(i)" class="remove-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>
      <button (click)="addOption()" class="add-option-btn">
        <span>+</span> Add Option
      </button>
    </div>
  `,
  styles: [`
    .options-editor { display: flex; flex-direction: column; gap: 0.75rem; }
    .section-label { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
    .options-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .option-row { display: flex; gap: 0.5rem; align-items: center; }
    .option-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--input-bg);
      font-size: 0.85rem;
    }
    .remove-btn {
      color: #ef4444;
      padding: 4px;
      border-radius: 4px;
    }
    .remove-btn:hover { background: rgba(239, 68, 68, 0.1); }
    .add-option-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border: 1px dashed var(--border);
      border-radius: 6px;
      color: var(--accent);
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .add-option-btn:hover { background: rgba(139, 92, 246, 0.05); border-color: var(--accent); }
  `]
})
export class OptionsEditorComponent {
  @Input() options: string[] = [];
  @Output() optionsChange = new EventEmitter<string[]>();

  trackByFn(index: number) { return index; }

  addOption() {
    this.options.push(`Option ${this.options.length + 1}`);
    this.onOptionChange();
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
    this.onOptionChange();
  }

  onOptionChange() {
    this.optionsChange.emit([...this.options]);
  }
}
