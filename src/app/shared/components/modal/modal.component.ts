import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="modal.isOpen()" (click)="modal.cancel()">
      <div class="modal-content fade-in" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2>{{ modal.config()?.title }}</h2>
          <button class="close-btn" (click)="modal.cancel()">
            <span class="material-icons">close</span>
          </button>
        </header>

        <div class="modal-body">
          <p class="message">{{ modal.config()?.message }}</p>
          
          <div class="prompt-field" *ngIf="modal.config()?.type === 'prompt'">
            <input 
              type="text" 
              [(ngModel)]="inputValue" 
              [placeholder]="modal.config()?.placeholder || 'Enter value...'"
              (keyup.enter)="modal.confirm(inputValue)"
              autofocus
            >
          </div>
        </div>

        <footer class="modal-footer">
          <button class="btn-secondary" (click)="modal.cancel()">
            {{ modal.config()?.cancelText || 'Cancel' }}
          </button>
          <button 
            [class]="'btn-' + (modal.config()?.type || 'primary')" 
            (click)="modal.confirm(modal.config()?.type === 'prompt' ? inputValue : true)"
          >
            {{ modal.config()?.confirmText || 'Confirm' }}
          </button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 24px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-header h2 { font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .close-btn { color: var(--text-secondary); transition: color 0.2s; }
    .close-btn:hover { color: var(--accent); }

    .modal-body { padding: 2rem; }
    .message { color: var(--text-secondary); line-height: 1.6; margin: 0 0 1.5rem; }

    .prompt-field input {
      width: 100%;
      padding: 1rem 1.25rem;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: 12px;
      color: var(--text-primary);
      font-weight: 600;
      outline: none;
      transition: border-color 0.2s;
    }
    .prompt-field input:focus { border-color: var(--accent); }

    .modal-footer {
      padding: 1.5rem 2rem;
      background: var(--bg-primary);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: var(--input-bg); color: var(--text-primary); }

    .btn-primary, .btn-prompt, .btn-info, .btn-success {
      background: var(--accent);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.2s;
    }
    .btn-danger { background: #ef4444; color: white; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; }
    button:hover { filter: brightness(1.1); }

    .fade-in { animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ModalComponent {
  modal = inject(ModalService);
  inputValue = '';

  constructor() {
    effect(() => {
      const isOpen = this.modal.isOpen();
      if (isOpen) {
        this.inputValue = this.modal.config()?.initialValue || '';
      }
    });
  }
}
