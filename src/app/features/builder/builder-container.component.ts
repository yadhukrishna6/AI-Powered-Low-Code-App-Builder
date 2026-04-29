import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';

@Component({
  selector: 'app-builder-container',
  standalone: true,
  imports: [
    CommonModule,
    TopNavComponent,
    PaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent
  ],
  template: `
    <div class="builder-shell">
      <app-top-nav></app-top-nav>
      
      <main class="builder-content">
        <aside class="left-panel">
          <app-palette></app-palette>
        </aside>
        
        <section class="center-panel">
          <app-canvas></app-canvas>
        </section>
        
        <aside class="right-panel">
          <app-properties-panel></app-properties-panel>
        </aside>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background: #f8fafc;
      color: #1e293b;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .builder-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .builder-content {
      flex: 1;
      display: grid;
      grid-template-columns: 280px 1fr 340px;
      overflow: hidden;
    }
    .left-panel, .right-panel {
      overflow-y: auto;
      background: white;
    }
    .center-panel {
      overflow-y: auto;
      background: #f8fafc;
      padding: 2rem;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
  `]
})
export class BuilderContainerComponent {}
