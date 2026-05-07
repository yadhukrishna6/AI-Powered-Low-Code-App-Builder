import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { PaletteComponent } from './components/palette/palette.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { AIAssistantComponent } from './components/ai-assistant/ai-assistant.component';
import { ProjectService } from '../../core/services/project.service';
import { FormBuilderService } from '../../core/services/form-builder.service';

// Main workspace container for the visual designer
@Component({
  selector: 'app-builder-container',
  standalone: true,
  imports: [
    CommonModule,
    TopNavComponent,
    PaletteComponent,
    CanvasComponent,
    PropertiesPanelComponent,
    AIAssistantComponent
  ],
  template: `
    <div class="designer-workspace">
      <app-top-nav 
        [projectName]="projectService.activeProject()?.name ?? 'Untitled App'"
        (onAiClick)="showAiModal.set(true)">
      </app-top-nav>
      
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

      <!-- AI Assistant Modal -->
      <app-ai-assistant 
        *ngIf="showAiModal()" 
        (close)="showAiModal.set(false)">
      </app-ai-assistant>
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
export class BuilderContainerComponent implements OnInit {
  route = inject(ActivatedRoute);
  projectService = inject(ProjectService);
  formService = inject(FormBuilderService);
  showAiModal = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectService.setActiveProject(id);
      // Load form from API
      this.formService.loadForm(id);
    }
  }
}
