import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';

@Component({
  selector: 'app-builder-container',
  standalone: true,
  imports: [
    CommonModule,
    PaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent
  ],
  template: `
    <div class="builder-shell">
      <header class="builder-nav">
        <div class="logo">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">LowCodeBuilder</span>
        </div>
        <div class="status-badge">Live Editor</div>
      </header>
      
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
      background: #020617;
      color: white;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .builder-shell {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .builder-nav {
      height: 64px;
      padding: 0 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 10;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #8b5cf6, #d946ef);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo-text {
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.025em;
    }
    .status-badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 99px;
      font-weight: 600;
    }
    .builder-content {
      flex: 1;
      display: grid;
      grid-template-columns: 280px 1fr 320px;
      overflow: hidden;
    }
    .left-panel, .right-panel {
      overflow-y: auto;
    }
    .center-panel {
      overflow-y: auto;
      background: #0f172a;
    }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `]
})
export class BuilderContainerComponent {}
