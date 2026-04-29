import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="side-nav" [class.collapsed]="isCollapsed()">
      <div class="nav-header">
        <button class="toggle-btn" (click)="toggle()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18" *ngIf="isCollapsed()"/>
            <path d="M19 12H5M12 19l-7-7 7-7" *ngIf="!isCollapsed()"/>
          </svg>
        </button>
      </div>

      <div class="nav-items">
        <div class="nav-item active" title="Visual App Designer">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <span class="label">Visual App Designer</span>
        </div>

        <div class="nav-item" title="Forms List">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <span class="label">Form Management</span>
        </div>

        <div class="nav-item" title="Submissions">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <span class="label">Submissions</span>
        </div>

        <div class="nav-item" title="Settings">
          <div class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <span class="label">Settings</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .side-nav {
      width: 260px;
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
      width: 72px;
    }
    .nav-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .toggle-btn {
      color: var(--text-secondary);
      transition: color 0.2s;
    }
    .toggle-btn:hover {
      color: var(--accent);
    }
    .nav-items {
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .nav-item:hover {
      background: var(--input-bg);
      color: var(--text-primary);
    }
    .nav-item.active {
      background: var(--input-bg);
      color: var(--accent);
      border-right: 3px solid var(--accent);
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
      font-weight: 500;
      font-size: 0.95rem;
      opacity: 1;
      transition: opacity 0.2s;
    }
    .collapsed .label {
      opacity: 0;
      pointer-events: none;
    }
  `]
})
export class SideNavComponent {
  isCollapsed = signal(true);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
