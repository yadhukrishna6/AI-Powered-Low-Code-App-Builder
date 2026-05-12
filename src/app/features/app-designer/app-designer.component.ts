import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppDesignerService } from './services/app-designer.service';
import { ProjectService } from '../../core/services/project.service';
import { LayoutBuilderComponent } from './components/layout-builder/layout-builder.component';
import { PageListComponent } from './components/page-list/page-list.component';
import { ModalService } from '../../core/services/modal.service';
import { AppCopilotComponent } from './components/app-copilot/app-copilot.component';

@Component({
  selector: 'app-app-designer',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutBuilderComponent, PageListComponent, AppCopilotComponent],
  template: `
    <div class="designer-container">
      <header class="designer-header">
        <div class="header-left">
          <span class="material-icons header-icon">rocket_launch</span>
          <div>
            <h1>App Architect</h1>
            <p>{{ projectName() }} • Full-Stack Application Structure</p>
          </div>
        </div>
        
        <div class="header-tabs">
          <button [class.active]="activeTab() === 'pages'" (click)="activeTab.set('pages')">Pages</button>
          <button [class.active]="activeTab() === 'layout'" (click)="activeTab.set('layout')">Layout & Navigation</button>
          <button [class.active]="activeTab() === 'theme'" (click)="activeTab.set('theme')">Theming</button>
        </div>

        <div class="header-actions">
          <button class="btn-copilot" (click)="showCopilot.set(!showCopilot())">
            <span class="material-icons">auto_awesome</span>
            AI Copilot
          </button>
          <div class="divider"></div>
          <button class="btn-primary" (click)="publishApp()">
            <span class="material-icons">publish</span>
            Publish App
          </button>
        </div>
      </header>

      <main class="designer-content">
        <div class="main-workspace">
          <div class="tab-content" [ngSwitch]="activeTab()">
            <app-page-list *ngSwitchCase="'pages'"></app-page-list>
            <app-layout-builder *ngSwitchCase="'layout'"></app-layout-builder>
            <div *ngSwitchCase="'theme'" class="theme-placeholder">
               <span class="material-icons">palette</span>
               <h3>Enterprise Theme Engine</h3>
               <p>Custom CSS variable management and corporate branding options coming soon.</p>
            </div>
          </div>
        </div>
        
        <div class="copilot-sidebar" [class.visible]="showCopilot()">
           <app-app-copilot></app-app-copilot>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .designer-container { display: flex; flex-direction: column; height: 100vh; background: var(--bg-primary); }
    .designer-header {
      height: 72px; padding: 0 2rem; background: var(--bg-secondary);
      border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;
    }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { font-size: 2rem; color: #10b981; }
    .header-left h1 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    .header-left p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }

    .header-tabs { display: flex; gap: 2rem; margin-left: 3rem; height: 100%; }
    .header-tabs button {
      height: 100%; padding: 0 0.5rem; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
      position: relative; transition: color 0.2s;
    }
    .header-tabs button:hover { color: var(--text-primary); }
    .header-tabs button.active { color: var(--accent); }
    .header-tabs button.active::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--accent); border-radius: 3px 3px 0 0;
    }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .divider { width: 1px; height: 24px; background: var(--border); }
    
    .btn-copilot {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; border-radius: 10px;
      background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: 700; font-size: 0.85rem;
    }

    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.5rem; border-radius: 10px;
      background: var(--accent); color: var(--bg-primary);
      font-weight: 700; font-size: 0.85rem; transition: all 0.2s;
    }

    .designer-content { flex: 1; display: flex; overflow: hidden; }
    .main-workspace { flex: 1; overflow-y: auto; padding: 2rem; }
    .tab-content { max-width: 1200px; margin: 0 auto; width: 100%; }

    .copilot-sidebar { width: 0; background: var(--bg-secondary); border-left: 0 solid var(--border); transition: all 0.3s; overflow: hidden; }
    .copilot-sidebar.visible { width: 400px; border-left-width: 1px; }

    .theme-placeholder {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 5rem; text-align: center; color: var(--text-secondary);
      background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 20px;
    }
    .theme-placeholder .material-icons { font-size: 4rem; opacity: 0.2; margin-bottom: 1rem; }
  `]
})
export class AppDesignerComponent implements OnInit {
  service = inject(AppDesignerService);
  projectService = inject(ProjectService);
  route = inject(ActivatedRoute);
  modal = inject(ModalService);

  projectName = signal('Loading Project...');
  projectId: string = '';
  activeTab = signal('pages');
  showCopilot = signal(true);

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      const project = await this.projectService.getProject(this.projectId);
      this.projectName.set(project.name);
      await this.service.loadAppMetadata(this.projectId);
    }
  }

  async publishApp() {
    await this.modal.show({
      title: 'Publish Application',
      message: 'This will freeze the current version of layouts, pages, and workflows and make them available at the production URL. Proceed?',
      type: 'success',
      confirmText: 'Publish Live'
    });
  }
}
