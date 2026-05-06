import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rule {
  id: string;
  name: string;
  condition: {
    field: string;
    operator: string;
    value: string;
  };
  action: {
    type: 'show' | 'hide' | 'require' | 'disable' | 'value';
    target: string;
    value?: string;
  };
  isActive: boolean;
}

@Component({
  selector: 'app-rule-engine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rule-engine-container">
      <header class="rule-header">
        <div class="header-info">
          <h2>Business Rules</h2>
          <p>Define dynamic behavior and validations for your application.</p>
        </div>
        <button class="btn-add" (click)="addRule()">
          <span class="material-icons">add</span>
          New Rule
        </button>
      </header>

      <div class="rules-list">
        <div *ngFor="let rule of rules()" class="rule-card" [class.inactive]="!rule.isActive">
          <div class="rule-main">
            <div class="rule-status">
              <label class="switch">
                <input type="checkbox" [(ngModel)]="rule.isActive">
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="rule-details">
              <div class="rule-title">
                <input type="text" [(ngModel)]="rule.name" placeholder="Rule Name">
              </div>
              
              <div class="rule-logic">
                <div class="logic-block if">
                  <span class="label">IF</span>
                  <input type="text" [(ngModel)]="rule.condition.field" placeholder="Field ID">
                  <select [(ngModel)]="rule.condition.operator">
                    <option value="eq">Equals</option>
                    <option value="neq">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="gt">Greater Than</option>
                  </select>
                  <input type="text" [(ngModel)]="rule.condition.value" placeholder="Value">
                </div>

                <div class="logic-arrow">
                  <span class="material-icons">arrow_forward</span>
                </div>

                <div class="logic-block then">
                  <span class="label">THEN</span>
                  <select [(ngModel)]="rule.action.type">
                    <option value="show">Show</option>
                    <option value="hide">Hide</option>
                    <option value="require">Make Required</option>
                    <option value="disable">Disable</option>
                    <option value="value">Set Value</option>
                  </select>
                  <input type="text" [(ngModel)]="rule.action.target" placeholder="Target Field">
                </div>
              </div>
            </div>

            <div class="rule-actions">
              <button class="btn-delete" (click)="deleteRule(rule.id)">
                <span class="material-icons">delete_outline</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="rules().length === 0" class="empty-rules">
          <span class="material-icons">rule</span>
          <h3>No Rules Defined</h3>
          <p>Create rules to add conditional logic to your forms and workflows.</p>
          <button class="btn-outline" (click)="addRule()">Get Started</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rule-engine-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 2rem;
      background: var(--bg-primary);
      overflow-y: auto;
    }

    .rule-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header-info h2 { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem; }
    .header-info p { color: var(--text-secondary); font-size: 0.9rem; }

    .btn-add {
      background: var(--accent);
      color: var(--bg-primary);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
      transition: all 0.2s;
    }
    .btn-add:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.3); }

    .rules-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .rule-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      transition: all 0.3s;
    }
    .rule-card:hover { border-color: var(--accent); box-shadow: var(--card-shadow); }
    .rule-card.inactive { opacity: 0.6; }

    .rule-main {
      display: flex;
      align-items: flex-start;
      gap: 1.5rem;
    }

    .rule-details { flex: 1; }
    .rule-title input {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      border: none;
      background: none;
      padding: 0;
      margin-bottom: 1rem;
      width: 100%;
    }
    .rule-title input:focus { outline: none; border-bottom: 1px solid var(--accent); }

    .rule-logic {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .logic-block {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-primary);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .logic-block .label { font-weight: 800; font-size: 0.75rem; color: var(--accent); width: 40px; }
    
    .logic-block input, .logic-block select {
      background: none;
      border: none;
      color: var(--text-primary);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 4px;
    }
    .logic-block input:focus, .logic-block select:focus { outline: none; color: var(--accent); }

    .logic-arrow { color: var(--text-secondary); opacity: 0.5; }

    .btn-delete {
      color: var(--text-secondary);
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .btn-delete:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

    /* Switch Component */
    .switch { position: relative; display: inline-block; width: 40px; height: 22px; }
    .switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
      background-color: var(--border); transition: .4s; border-radius: 34px;
    }
    .slider:before {
      position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: var(--accent); }
    input:checked + .slider:before { transform: translateX(18px); }

    .empty-rules {
      text-align: center;
      padding: 5rem;
      color: var(--text-secondary);
    }
    .empty-rules .material-icons { font-size: 4rem; opacity: 0.2; margin-bottom: 1.5rem; }
    .empty-rules h3 { color: var(--text-primary); margin-bottom: 0.5rem; }
    .btn-outline {
      margin-top: 1.5rem;
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 0.6rem 1.5rem;
      border-radius: 10px;
      font-weight: 700;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: var(--accent); color: var(--bg-primary); }
  `]
})
export class RuleEngineComponent {
  rules = signal<Rule[]>([
    {
      id: 'rule_1',
      name: 'Hide Comments on Low Rating',
      condition: { field: 'rating', operator: 'lt', value: '3' },
      action: { type: 'hide', target: 'comments' },
      isActive: true
    }
  ]);

  addRule() {
    const newRule: Rule = {
      id: `rule_${Date.now()}`,
      name: 'New Business Rule',
      condition: { field: '', operator: 'eq', value: '' },
      action: { type: 'show', target: '' },
      isActive: true
    };
    this.rules.update(r => [...r, newRule]);
  }

  deleteRule(id: string) {
    this.rules.update(r => r.filter(rule => rule.id !== id));
  }
}
