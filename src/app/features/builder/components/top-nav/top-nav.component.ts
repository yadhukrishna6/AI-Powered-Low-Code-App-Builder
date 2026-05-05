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
<<<<<<< HEAD
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      z-index: 100;
      transition: all 0.3s;
=======
      background: white;
      border-bottom: 1px solid #e2e8f0;
      z-index: 100;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .nav-left .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      width: 24px;
      height: 24px;
<<<<<<< HEAD
      color: var(--accent);
=======
      color: #8b5cf6;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .logo-text {
      font-weight: 700;
      font-size: 1.25rem;
<<<<<<< HEAD
      color: var(--text-primary);
=======
      color: #0f172a;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      letter-spacing: -0.025em;
    }
    .nav-center {
      display: flex;
      align-items: center;
      gap: 1rem;
<<<<<<< HEAD
      background: var(--input-bg);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--border);
=======
      background: #f1f5f9;
      padding: 4px;
      border-radius: 12px;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
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
<<<<<<< HEAD
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
=======
      color: #64748b;
      transition: all 0.2s;
    }
    .toggle-btn.active, .preview-btn.active {
      background: white;
      color: #8b5cf6;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .toggle-btn:hover:not(.active), .preview-btn:hover:not(.active), .history-btn:hover {
      background: rgba(255,255,255,0.5);
      color: #0f172a;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .divider {
      width: 1px;
      height: 24px;
<<<<<<< HEAD
      background: var(--border);
=======
      background: #e2e8f0;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      margin: 0 4px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .btn-save {
<<<<<<< HEAD
      background: var(--accent);
=======
      background: #8b5cf6;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      color: white;
      padding: 0.625rem 1.25rem;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .btn-save:hover:not(:disabled) {
<<<<<<< HEAD
      background: var(--accent-hover);
=======
      background: #7c3aed;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.3);
    }
    .btn-save:disabled {
<<<<<<< HEAD
      opacity: 0.5;
=======
      opacity: 0.7;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      cursor: not-allowed;
    }
    .btn-play {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
<<<<<<< HEAD
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
=======
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      color: #64748b;
      transition: all 0.2s;
    }
    .btn-play:hover {
      background: white;
      color: #0f172a;
      border-color: #cbd5e1;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
    }
    .user-avatar {
      width: 40px;
      height: 40px;
<<<<<<< HEAD
      background: var(--input-bg);
      color: var(--text-secondary);
=======
      background: #f1f5f9;
      color: #64748b;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-weight: 600;
<<<<<<< HEAD
      border: 1px solid var(--border);
=======
      font-size: 0.875rem;
>>>>>>> b74a011b5b8280ab7fac5925a29a405bf1eb4792
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
