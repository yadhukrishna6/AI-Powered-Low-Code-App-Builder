import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../../core/services/project.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="side-nav" [class.collapsed]="isCollapsed()">
      <div class="nav-header">
        <div class="logo-box">
          <div class="logo-circle">
            <span class="material-icons">bolt</span>
          </div>
          <span class="logo-text">FlowForge</span>
        </div>
        <button class="toggle-btn" (click)="toggle()" [title]="isCollapsed() ? 'Expand' : 'Collapse'">
          <span class="material-icons">
            {{ isCollapsed() ? 'menu' : 'menu_open' }}
          </span>
        </button>
      </div>

      <div class="nav-scroll thin-scrollbar">
        <div class="nav-section">
          <div class="nav-item" 
               routerLink="/dashboard"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: true}"
               title="Home Dashboard">
            <div class="icon-box">
              <span class="material-icons">dashboard</span>
            </div>
            <span class="label">Dashboard</span>
          </div>
        </div>

        <!-- Project Context (Step-by-Step Build Flow) -->
        <div class="nav-section" *ngIf="projectService.activeProject() as project">
          <div class="section-label">BUILD: {{ project.name }}</div>
          
          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'data']"
               routerLinkActive="active"
               title="1. Database: Define your data models and entities">
            <div class="icon-box">
              <span class="material-icons">database</span>
            </div>
            <span class="label">1. Database</span>
          </div>

          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'designer']"
               routerLinkActive="active"
               title="2. Designer: Build visual forms and pages">
            <div class="icon-box">
              <span class="material-icons">architecture</span>
            </div>
            <span class="label">2. UI Designer</span>
          </div>

          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'workflow']"
               routerLinkActive="active"
               title="3. Workflows: Automate business processes">
            <div class="icon-box">
              <span class="material-icons">hub</span>
            </div>
            <span class="label">3. Workflows</span>
          </div>

          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'rules']"
               routerLinkActive="active"
               title="4. Rules: Define fine-grained business logic">
            <div class="icon-box">
              <span class="material-icons">gavel</span>
            </div>
            <span class="label">4. Rule Engine</span>
          </div>

          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'app']"
               routerLinkActive="active"
               title="5. App Architect: Configure app shell and routing">
            <div class="icon-box">
              <span class="material-icons">rocket_launch</span>
            </div>
            <span class="label">5. App Architect</span>
          </div>

          <div class="nav-item" 
               [routerLink]="['/project', project.id, 'submissions']"
               routerLinkActive="active"
               title="6. Data: View and manage application data">
            <div class="icon-box">
              <span class="material-icons">storage</span>
            </div>
            <span class="label">6. Submissions</span>
          </div>
        </div>

        <!-- System Section -->
        <div class="nav-section">
          <div class="section-label">SYSTEM</div>
          
          <div class="nav-item" 
               routerLink="/settings"
               routerLinkActive="active"
               title="Settings">
            <div class="icon-box">
              <span class="material-icons">settings</span>
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
    .logo-circle {
      width: 32px;
      height: 32px;
      background: var(--accent);
      color: var(--bg-primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-circle .material-icons { font-size: 1.25rem; }
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toggle-btn:hover {
      background: var(--input-bg);
      color: var(--accent);
    }
    .toggle-btn .material-icons { font-size: 1.25rem; }

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
      text-decoration: none;
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
  projectService = inject(ProjectService);
  isCollapsed = signal(true);

  toggle() {
    this.isCollapsed.set(!this.isCollapsed());
  }
}
