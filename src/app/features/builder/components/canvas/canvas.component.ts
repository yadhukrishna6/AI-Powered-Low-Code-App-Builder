import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FormBuilderService } from '../../../../core/services/form-builder.service';
import { FieldType, FormField } from '../../../../core/models/form.model';
import { DynamicRendererComponent } from './dynamic-renderer.component';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule, DragDropModule, DynamicRendererComponent],
  template: `
    <div class="canvas-wrapper">
      <div class="canvas-header">
        <h2 class="canvas-title">Form Canvas</h2>
        <p class="canvas-subtitle">Drag layout components and inputs to build your interface</p>
      </div>

      <div 
        id="canvas-root"
        class="canvas-drop-zone"
        [class.tablet]="service.canvasMode() === 'tablet'"
        [class.mobile]="service.canvasMode() === 'mobile'"
        cdkDropList
        [cdkDropListData]="service.schema().fields"
        [cdkDropListConnectedTo]="service.allDropListIds()"
        (cdkDropListDropped)="onDrop($event)"
      >
        @if (service.schema().fields.length === 0) {
          <div class="empty-state">
            <div class="empty-icon-box">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
            </div>
            <h3>Start building your form</h3>
            <p>Drag components here from the left sidebar</p>
          </div>
        }

        <app-dynamic-renderer 
          *ngFor="let field of service.schema().fields" 
          [field]="field">
        </app-dynamic-renderer>
      </div>

      <!-- ... schema preview section ... -->

      <div class="schema-preview-section">
        <div class="schema-header">
          <h3 class="schema-title">Generated Schema</h3>
          <div class="json-badge">
            <span>&#123; &#125;</span>
            JSON Preview
          </div>
        </div>
        <div class="code-box">
          <pre><code>{{ service.getSchemaJson() }}</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-wrapper {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      max-width: 900px;
      margin: 0 auto;
      transition: all 0.3s;
    }
    .canvas-header {
      margin-bottom: 0.5rem;
    }
    .canvas-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    .canvas-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    .canvas-drop-zone {
      min-height: 400px;
      background: var(--bg-secondary);
      border: 2px dashed var(--border);
      border-radius: 20px;
      padding: 2rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin: 0 auto;
      width: 100%;
    }
    .canvas-drop-zone.tablet {
      max-width: 768px;
    }
    .canvas-drop-zone.mobile {
      max-width: 375px;
    }
    .canvas-drop-zone.cdk-drop-list-dragging {
      border-color: var(--accent);
      background: var(--input-bg);
    }
    .empty-state {
      height: 350px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      text-align: center;
    }
    .empty-icon-box {
      width: 80px;
      height: 80px;
      background: var(--bg-primary);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      color: var(--accent);
      border: 1px solid var(--border);
    }
    .empty-state h3 {
      color: var(--text-primary);
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .field-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 1.25rem;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    .field-card:hover {
      border-color: var(--accent);
      box-shadow: var(--card-shadow);
    }
    .field-card.selected {
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent), var(--card-shadow);
    }
    .field-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .drag-handle {
      cursor: grab;
      display: flex;
      align-items: center;
      color: var(--text-secondary);
    }
    .field-actions {
      display: flex;
      gap: 0.5rem;
    }
    .action-btn {
      padding: 6px;
      border-radius: 8px;
      color: var(--text-secondary);
      transition: all 0.2s;
    }
    .action-btn:hover {
      background: var(--input-bg);
      color: var(--text-primary);
    }
    .action-btn.delete:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .field-label {
      display: block;
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }
    .required {
      color: #ef4444;
      margin-left: 2px;
    }
    .field-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .schema-preview-section {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 1.5rem;
    }
    .schema-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .schema-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .json-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 6px 12px;
      background: var(--input-bg);
      color: var(--accent);
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid var(--border);
    }
    .code-box {
      background: var(--bg-primary);
      border-radius: 12px;
      padding: 1.25rem;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid var(--border);
    }
    .code-box pre {
      margin: 0;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      font-size: 0.85rem;
      color: var(--text-primary);
      line-height: 1.6;
    }
  `]
})
export class CanvasComponent {
  service = inject(FormBuilderService);

  onDrop(event: CdkDragDrop<any>) {
    if (event.previousContainer === event.container) {
      this.service.moveField(event.previousIndex, event.currentIndex);
    } else {
      const fieldData = event.item.data;
      if (typeof fieldData === 'string') {
        this.service.addField(fieldData as FieldType, event.currentIndex);
      } else {
        this.service.moveField(event.previousIndex, event.currentIndex);
      }
    }
  }

  async saveSchema() {
    const formName = prompt('Enter a name for your form:', 'New Awesome Form');
    
    if (formName) {
      try {
        await this.service.saveForm(formName);
        alert('Form saved successfully to FlowForge Backend!');
      } catch (error) {
        alert('Failed to save form. Make sure the backend is running.');
      }
    }
  }
}
