import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService, AppView } from '../../../../core/services/navigation.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="side-nav" [class.collapsed]="isCollapsed()">
      <div class="nav-header">
        <div class="logo-box">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">FlowForge</span>
        </div>
        <button class="toggle-btn" (click)="toggle()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" *ngIf="isCollapsed()"/>
            <path d="M19 12H5M12 19l-7-7 7-7" *ngIf="!isCollapsed()"/>
          </svg>
        </button>
      </div>

      <div class="nav-scroll">
        <div class="nav-section">
          <div class="section-label">DESIGN</div>
          
          <div class="nav-item" 
               [class.active]="nav.activeView() === 'designer'" 
               (click)="nav.setView('designer')"
               title="Visual App Designer">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>
              </svg>
            </div>
            <span class="label">Visual App Designer</span>
          </div>

          <div class="nav-item" 
               [class.active]="nav.activeView() === 'workflow'"
               (click)="nav.setView('workflow')"
               title="Workflow Automation">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span class="label">Workflow Automation</span>
          </div>

          <div class="nav-item" 
               [class.active]="nav.activeView() === 'rules'"
               (click)="nav.setView('rules')"
               title="Rule Engine">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <span class="label">Rule Engine</span>
          </div>
        </div>

        <div class="nav-section">
          <div class="section-label">DATA</div>
          
          <div class="nav-item" 
               [class.active]="nav.activeView() === 'forms'"
               (click)="nav.setView('forms')"
               title="Form Management">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <span class="label">Form Management</span>
          </div>

          <div class="nav-item" 
               [class.active]="nav.activeView() === 'submissions'"
               (click)="nav.setView('submissions')"
               title="Submissions">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span class="label">Submissions</span>
          </div>
        </div>

        <div class="nav-section">
          <div class="section-label">SYSTEM</div>
          
          <div class="nav-item" 
               [class.active]="nav.activeView() === 'settings'"
               (click)="nav.setView('settings')"
               title="Settings">
            <div class="icon-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <span class="label">Settings</span>
          </div>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .side-nav {
      width: 280px;
      height: 100vh;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      z-index: 200;
    }
    .side-nav.collapsed {
      width: 80px;
    }
    
    /* Header & Logo */
    .nav-header {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      overflow: hidden;
    }
    .logo-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      transition: opacity 0.2s;
    }
    .collapsed .logo-text { opacity: 0; }

    .toggle-btn {
      color: var(--text-secondary);
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .toggle-btn:hover {
      background: var(--input-bg);
      color: var(--accent);
    }

    /* Scrollable Area */
    .nav-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem 0;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Sections */
    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .section-label {
      padding: 0 1.75rem;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      transition: opacity 0.2s;
    }
    .collapsed .section-label { opacity: 0; }

    /* Nav Items */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1.75rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      position: relative;
    }
    .nav-item:hover {
      color: var(--text-primary);
      background: rgba(var(--accent-rgb), 0.05);
    }
    .nav-item.active {
      color: var(--accent);
      background: rgba(var(--accent-rgb), 0.08);
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: var(--accent);
      border-radius: 0 4px 4px 0;
    }

    .icon-box {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .label {
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .collapsed .label {
      opacity: 0;
      pointer-events: none;
    }
  `]
})
export class SideNavComponent {
  nav = inject(NavigationService);
  isCollapsed = signal(true);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
