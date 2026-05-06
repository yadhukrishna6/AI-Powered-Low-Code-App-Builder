import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="top-nav">
      <div class="nav-left">
        <div class="context-label">
          <span class="material-icons">architecture</span>
          <span class="label-text">App Designer</span>
        </div>
      </div>

      <div class="nav-center">
        <button class="btn-ai" (click)="onAiClick.emit()">
          <span class="material-icons">auto_awesome</span>
          <span>AI Assistant</span>
        </button>

        <div class="divider"></div>

        <div class="device-preview">
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'desktop'"
            (click)="service.setCanvasMode('desktop')"
            title="Desktop View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'tablet'"
            (click)="service.setCanvasMode('tablet')"
            title="Tablet View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </button>
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'mobile'"
            (click)="service.setCanvasMode('mobile')"
            title="Mobile View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="7" y="2" width="10" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="divider"></div>

        <div class="history-controls">
          <button class="history-btn" (click)="service.undo()" title="Undo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </button>
          <button class="history-btn" (click)="service.redo()" title="Redo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="nav-right">
        <button class="btn-clear" (click)="service.clearCanvas()">
          Clear
        </button>
        <button 
          class="btn-save" 
          (click)="save()"
          [disabled]="service.isSaving()"
        >
          <span class="material-icons" *ngIf="!service.isSaving()">save</span>
          {{ service.isSaving() ? 'Saving...' : 'Save App' }}
        </button>
        <button class="btn-play" title="Live Preview">
          <span class="material-icons">play_arrow</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .top-nav {
      height: 56px;
      padding: 0 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border);
      z-index: 90;
    }
    .nav-left .context-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--text-primary);
    }
    .context-label .material-icons { font-size: 1.2rem; color: var(--accent); opacity: 0.8; }
    .context-label .label-text { font-weight: 700; font-size: 0.9rem; letter-spacing: -0.01em; }

    .nav-center {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--bg-secondary);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    .btn-ai {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-ai:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(168, 85, 247, 0.3); }
    .btn-ai .material-icons { font-size: 1rem; }

    .device-preview, .history-controls { display: flex; gap: 1px; }
    
    .preview-btn, .history-btn {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .preview-btn.active {
      background: var(--bg-primary);
      color: var(--accent);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .preview-btn:hover:not(.active), .history-btn:hover {
      background: var(--input-bg);
      color: var(--text-primary);
    }

    .divider { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }

    .nav-right { display: flex; align-items: center; gap: 0.75rem; }

    .btn-clear {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }
    .btn-clear:hover { color: #ef4444; background: rgba(239,68,68,0.05); }

    .btn-save {
      background: var(--accent);
      color: var(--bg-primary);
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .btn-save .material-icons { font-size: 1.1rem; }
    .btn-save:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-play {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-play:hover { color: #10b981; border-color: #10b981; background: rgba(16,185,129,0.05); }
    .btn-play .material-icons { font-size: 1.3rem; }
  `]
})
export class TopNavComponent {
  service = inject(FormBuilderService);
  @Output() onAiClick = new EventEmitter<void>();

  save() {
    const formName = prompt('Enter a name for your form:', 'New Awesome Form');
    if (formName) {
      this.service.saveForm(formName).then(() => {
        alert('Form saved successfully!');
      }).catch(() => {
        alert('Failed to save form.');
      });
    }
  }
}
