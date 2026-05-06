import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';

@Component({
  selector: 'app-builder-container',
  standalone: true,
  imports: [
    CommonModule,
    TopNavComponent,
    PaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent,
    SideNavComponent
  ],
  template: `
    <div class="main-layout">
      <app-side-nav></app-side-nav>
      
      <div class="builder-shell">
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
  `]
})
export class BuilderContainerComponent {}
