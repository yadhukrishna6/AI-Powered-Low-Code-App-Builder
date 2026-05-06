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
    <div class="designer-workspace">
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
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    .designer-workspace {
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
      border-style: solid;
    }
    .left-panel { border-width: 0 1px 0 0; }
    .right-panel { border-width: 0 0 0 1px; }

    .center-panel {
      overflow-y: auto;
      background: var(--bg-primary);
      padding: 2rem;
      transition: background 0.3s ease;
    }
  `]
})
export class BuilderContainerComponent {}

