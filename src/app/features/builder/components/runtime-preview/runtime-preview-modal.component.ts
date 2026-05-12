import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuntimeAppComponent } from '../../../runtime/runtime-app.component';

@Component({
  selector: 'app-runtime-preview-modal',
  standalone: true,
  imports: [CommonModule, RuntimeAppComponent],
  template: `
    <div class="preview-overlay" (click)="onClose()">
      <div class="preview-modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div class="header-left">
            <span class="material-icons">visibility</span>
            <h3>Live Preview</h3>
            <span class="badge">Experimental</span>
          </div>
          <button class="close-btn" (click)="onClose()">
            <span class="material-icons">close</span>
          </button>
        </header>
        
        <div class="modal-body">
          <app-runtime-app></app-runtime-app>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .preview-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(10px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .preview-modal {
      width: 100%;
      height: 100%;
      max-width: 1200px;
      background: var(--bg-primary);
      border-radius: 20px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 30px 60px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
      animation: modalUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes modalUp {
      from { opacity: 0; transform: translateY(40px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-header {
      height: 60px;
      padding: 0 20px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-left { display: flex; align-items: center; gap: 12px; }
    .header-left .material-icons { color: var(--accent); }
    .header-left h3 { font-size: 0.95rem; font-weight: 700; margin: 0; }
    .badge { 
      font-size: 0.65rem; font-weight: 800; 
      padding: 4px 8px; border-radius: 6px;
      background: rgba(var(--accent-rgb), 0.1);
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .close-btn {
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .close-btn:hover { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      background: #f1f5f9;
    }

    :host ::ng-deep .runtime-layout {
      min-height: 100%;
    }
  `]
})
export class RuntimePreviewModalComponent {
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
