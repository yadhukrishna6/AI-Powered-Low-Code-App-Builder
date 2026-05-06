import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SideNavComponent } from '../../features/builder/components/side-nav/side-nav.component';
import { FormBuilderService } from '../../core/services/form-builder.service';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SideNavComponent],
  template: `
    <div class="platform-shell">
      <app-side-nav></app-side-nav>
      
      <div class="main-container">
        <header class="shell-topbar">
          <div class="topbar-left">
            <span class="view-title">{{ getPageTitle() }}</span>
          </div>
          <div class="topbar-right">
            <div class="theme-switcher">
              <button 
                [class.active]="themeService.theme() === 'light'"
                (click)="themeService.setTheme('light')"
              >
                <span class="material-icons">light_mode</span>
              </button>
              <button 
                [class.active]="themeService.theme() === 'dark'"
                (click)="themeService.setTheme('dark')"
              >
                <span class="material-icons">dark_mode</span>
              </button>
            </div>
            <div class="divider"></div>
            <div class="user-profile">
              <div class="avatar">Y</div>
              <span class="user-name">Yadhukrishna</span>
            </div>
          </div>
        </header>

        <main class="workspace-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .platform-shell {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--bg-primary);
    }

    .main-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
    }

    .shell-topbar {
      height: 64px;
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      z-index: 100;
    }

    .view-title { font-weight: 700; font-size: 0.9rem; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; }

    .topbar-right { display: flex; align-items: center; gap: 1rem; }

    .theme-switcher {
      display: flex;
      background: var(--input-bg);
      padding: 3px;
      border-radius: 10px;
      border: 1px solid var(--border);
    }
    .theme-switcher button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .theme-switcher button.active {
      background: var(--bg-primary);
      color: var(--accent);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .theme-switcher .material-icons { font-size: 1.1rem; }

    .divider { width: 1px; height: 24px; background: var(--border); }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 34px;
      height: 34px;
      background: var(--accent);
      color: var(--bg-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }

    .workspace-content {
      flex: 1;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
  `]
})
export class ShellLayoutComponent {
  themeService = inject(FormBuilderService);
  router = inject(Router);

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Platform Dashboard';
    if (url.includes('/designer')) return 'App Designer';
    if (url.includes('/workflow')) return 'Automation Workflows';
    if (url.includes('/rules')) return 'Business Rule Engine';
    if (url.includes('/submissions')) return 'Submissions & Data';
    if (url.includes('/settings')) return 'System Settings';
    return 'FlowForge Workspace';
  }
}
