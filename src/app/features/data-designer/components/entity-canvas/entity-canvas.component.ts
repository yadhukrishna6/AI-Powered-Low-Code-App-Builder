import { Component, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataDesignerService, EntityMetadata } from '../../services/data-designer.service';
import { jsPlumb, jsPlumbInstance } from 'jsplumb';

@Component({
  selector: 'app-entity-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="canvas-wrapper" #canvasWrapper>
      <div id="entity-diagram" class="diagram-container">
        <div 
          *ngFor="let entity of service.entities()" 
          [id]="entity.id" 
          class="entity-box"
          [class.selected]="service.selectedEntityId() === entity.id"
          (click)="selectEntity(entity.id!)"
        >
          <div class="entity-header">
            <span class="material-icons entity-icon">table_chart</span>
            <span class="entity-name">{{ entity.name }}</span>
          </div>
          <div class="entity-fields">
            <div *ngFor="let field of entity.fields" 
                 class="field-row"
                 [class.selected]="service.selectedFieldId() === field.id"
                 (click)="selectField($event, entity.id!, field.id!)">
              <span class="field-name">
                <span class="material-icons field-type-icon" *ngIf="field.isUnique">vpn_key</span>
                {{ field.name }}
              </span>
              <span class="field-type">{{ field.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .canvas-wrapper {
      width: 100%;
      height: 100%;
      overflow: auto;
      background: var(--bg-primary);
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      background-size: 30px 30px;
      position: relative;
    }

    .diagram-container {
      width: 3000px;
      height: 3000px;
      position: relative;
    }

    .entity-box {
      position: absolute;
      width: 200px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s, transform 0.2s;
      z-index: 10;
    }

    .entity-box:hover { border-color: var(--accent); }
    .entity-box.selected { border-color: var(--accent); border-width: 2px; transform: scale(1.02); z-index: 20; }

    .entity-header {
      padding: 0.75rem;
      background: var(--input-bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .entity-icon { font-size: 1.2rem; color: #a78bfa; }
    .entity-name { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }

    .entity-fields { padding: 0.5rem 0; }
    .field-row {
      padding: 0.25rem 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      border-left: 2px solid transparent;
      transition: all 0.2s;
    }
    .field-row:hover { background: rgba(var(--accent-rgb), 0.05); }
    .field-row.selected { background: rgba(var(--accent-rgb), 0.1); border-left-color: var(--accent); }
    
    .field-name { 
      color: var(--text-primary); 
      font-weight: 500; 
      display: flex; 
      align-items: center; 
      gap: 0.4rem; 
    }
    .field-type-icon { font-size: 0.9rem; color: #fbbf24; }
    .field-type { color: var(--text-secondary); opacity: 0.7; }
  `]
})
export class EntityCanvasComponent implements AfterViewInit, OnDestroy {
  service = inject(DataDesignerService);
  jsPlumbInstance?: jsPlumbInstance;

  @ViewChild('canvasWrapper') canvasWrapper!: ElementRef;

  ngAfterViewInit() {
    this.jsPlumbInstance = jsPlumb.getInstance({
      Connector: ['Bezier', { curviness: 50 }],
      DragOptions: { cursor: 'pointer', zIndex: 2000 },
      PaintStyle: { stroke: '#a78bfa', strokeWidth: 2 },
      Endpoint: ['Dot', { radius: 5 }],
      EndpointStyle: { fill: '#a78bfa' },
      HoverPaintStyle: { stroke: '#8b5cf6' },
      Container: 'entity-diagram'
    });

    this.initializeEntities();
  }

  private initializeEntities() {
    // We'll set random positions for now if not present
    this.service.entities().forEach((entity, index) => {
      const el = document.getElementById(entity.id!);
      if (el) {
        el.style.left = (50 + index * 250) + 'px';
        el.style.top = '50px';
        this.jsPlumbInstance?.draggable(el);
      }
    });
  }

  selectEntity(id: string) {
    this.service.selectedEntityId.set(id);
    this.service.selectedFieldId.set(null);
  }

  selectField(event: MouseEvent, entityId: string, fieldId: string) {
    event.stopPropagation();
    this.service.selectedEntityId.set(entityId);
    this.service.selectedFieldId.set(fieldId);
  }

  ngOnDestroy() {
    this.jsPlumbInstance?.reset();
  }
}
