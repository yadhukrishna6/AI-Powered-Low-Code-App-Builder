import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilderService } from '../../../../core/services/form-builder.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="top-nav">
      <div class="nav-left">
        <div class="logo">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
          </svg>
          <span class="logo-text">LowCodeBuilder</span>
        </div>
      </div>

      <div class="nav-center">
        <div class="theme-toggle">
          <button 
            class="toggle-btn" 
            [class.active]="service.theme() === 'light'"
            (click)="service.setTheme('light')"
          >Light</button>
          <button 
            class="toggle-btn" 
            [class.active]="service.theme() === 'dark'"
            (click)="service.setTheme('dark')"
          >Dark</button>
        </div>

        <div class="divider"></div>

        <div class="device-preview">
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'desktop'"
            (click)="service.setCanvasMode('desktop')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </button>
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'tablet'"
            (click)="service.setCanvasMode('tablet')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </button>
          <button 
            class="preview-btn" 
            [class.active]="service.canvasMode() === 'mobile'"
            (click)="service.setCanvasMode('mobile')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="7" y="2" width="10" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="divider"></div>

        <div class="history-controls">
          <button class="history-btn" (click)="service.undo()" title="Undo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </button>
          <button class="history-btn" (click)="service.redo()" title="Redo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="nav-right">
        <button 
          class="btn-save" 
          (click)="save()"
          [disabled]="service.isSaving()"
        >
          {{ service.isSaving() ? 'Saving...' : 'Save Schema' }}
        </button>
        <button class="btn-play">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <div class="user-avatar">Y</div>
      </div>
    </nav>
  `,
  styles: [`
    .top-nav {
      height: 64px;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      z-index: 100;
      transition: all 0.3s;
    }
    .nav-left .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      width: 24px;
      height: 24px;
      color: var(--accent);
    }
    .logo-text {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text-primary);
      letter-spacing: -0.025em;
    }
    .nav-center {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: var(--input-bg);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
    }
    .theme-toggle, .device-preview, .history-controls {
      display: flex;
      gap: 2px;
    }
    .toggle-btn, .preview-btn, .history-btn {
      padding: 6px 12px;
      font-size: 0.875rem;
      font-weight: 500;
      border-radius: 8px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .toggle-btn.active, .preview-btn.active {
      background: var(--bg-secondary);
      color: var(--accent);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .toggle-btn:hover:not(.active), .preview-btn:hover:not(.active), .history-btn:hover {
      background: var(--border);
      color: var(--text-primary);
    }
    .divider {
      width: 1px;
      height: 24px;
      background: var(--border);
      margin: 0 4px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-save {
      background: var(--accent);
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-save:hover:not(:disabled) {
      background: var(--accent-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
    }
    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-play {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .btn-play:hover {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border-color: var(--accent);
    }
    .user-avatar {
      width: 40px;
      height: 40px;
      background: var(--input-bg);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
      border: 1px solid var(--border);
    }
  `]
})
export class TopNavComponent {
  service = inject(FormBuilderService);

  save() {
    // This will trigger the save logic which is currently in CanvasComponent
    // We might want to move it to the service later, but for now we'll emit an event or just call the service method
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
