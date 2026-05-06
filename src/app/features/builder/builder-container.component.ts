import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { NavigationService } from '../../core/services/navigation.service';
import { WorkflowBuilderComponent } from '../workflow/workflow-builder/workflow-builder.component';

@Component({
  selector: 'app-builder-container',
  standalone: true,
  imports: [
    CommonModule,
    TopNavComponent,
    PaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent,
    SideNavComponent,
    WorkflowBuilderComponent
  ],
  template: `
    <div class="main-layout">
      <app-side-nav></app-side-nav>
      
      <div class="builder-shell" [ngSwitch]="nav.activeView()">
        
        <!-- Designer View -->
        <ng-container *ngSwitchCase="'designer'">
          <app-top-nav></app-top-nav>
          <main class="builder-content">
            <aside class="left-panel thin-scrollbar">
              <app-palette></app-palette>
            </aside>
            <section class="center-panel">
              <app-canvas></app-canvas>
            </section>
            <aside class="right-panel thin-scrollbar">
              <app-properties-panel></app-properties-panel>
            </aside>
          </main>
        </ng-container>

        <!-- Workflow View -->
        <ng-container *ngSwitchCase="'workflow'">
          <app-workflow-builder></app-workflow-builder>
        </ng-container>

        <!-- Placeholder for other views -->
        <div *ngSwitchDefault class="placeholder-view">
          <h2>{{ nav.activeView() | titlecase }} Module</h2>
          <p>This module is coming soon...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      transition: all 0.3s ease;
    }
    .main-layout {
      display: flex;
      height: 100%;
    }
    .builder-shell {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-width: 0;
    }
    .builder-content {
      flex: 1;
      display: grid;
      grid-template-columns: 280px 1fr 340px;
      overflow: hidden;
    }
    .left-panel, .right-panel {
      overflow-y: auto;
      background: var(--bg-secondary);
      border-color: var(--border);
    }
    .center-panel {
      overflow-y: auto;
      background: var(--bg-primary);
      padding: 2rem;
      transition: background 0.3s ease;
    }
    .placeholder-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      gap: 1rem;
    }
    .placeholder-view h2 { color: var(--text-primary); }
  `]
})
export class BuilderContainerComponent {
  nav = inject(NavigationService);
}

