import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DataDesignerService, EntityMetadata } from './services/data-designer.service';
import { ProjectService } from '../../core/services/project.service';
import { EntityCanvasComponent } from './components/entity-canvas/entity-canvas.component';
import { EntitySidebarComponent } from './components/entity-sidebar/entity-sidebar.component';
import { FieldBuilderComponent } from './components/field-builder/field-builder.component';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-data-designer',
  standalone: true,
  imports: [CommonModule, EntityCanvasComponent, EntitySidebarComponent, FieldBuilderComponent],
  template: `
    <div class="designer-container">
      <header class="designer-header">
        <div class="header-left">
          <span class="material-icons header-icon">database</span>
          <div>
            <h1>Data Model Designer</h1>
            <p>{{ projectName() }} • Entity Relationship Diagram</p>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn-secondary" (click)="addEntity()">
            <span class="material-icons">add</span>
            New Entity
          </button>
          <div class="divider"></div>
          <button class="btn-primary btn-publish" (click)="applyChanges()">
            <span class="material-icons">auto_fix_high</span>
            Apply & Migrate
          </button>
        </div>
      </header>

      <div class="designer-content">
        <app-entity-sidebar class="left-panel"></app-entity-sidebar>
        <app-entity-canvas class="canvas-region"></app-entity-canvas>
        <app-field-builder class="right-panel"></app-field-builder>
      </div>
    </div>
  `,
  styles: [`
    .designer-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: var(--bg-primary);
    }

    .designer-header {
      height: 72px;
      padding: 0 2rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
    }

    .header-left { display: flex; align-items: center; gap: 1rem; }
    .header-icon { 
      font-size: 2rem; 
      color: #a78bfa;
      filter: drop-shadow(0 0 8px rgba(167, 139, 250, 0.3));
    }
    .header-left h1 { font-size: 1.1rem; font-weight: 700; margin: 0; }
    .header-left p { font-size: 0.75rem; color: var(--text-secondary); margin: 0; }

    .header-actions { display: flex; align-items: center; gap: 1rem; }
    .divider { width: 1px; height: 24px; background: var(--border); }

    .btn-secondary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.2rem; border-radius: 10px;
      background: var(--bg-primary); border: 1px solid var(--border);
      color: var(--text-primary); font-weight: 600; font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-secondary:hover { background: var(--input-bg); border-color: var(--accent); }

    .btn-primary {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.5rem; border-radius: 10px;
      background: var(--accent); color: var(--bg-primary);
      font-weight: 700; font-size: 0.85rem;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.2);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(var(--accent-rgb), 0.3); }

    .designer-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .left-panel { width: 300px; border-right: 1px solid var(--border); background: var(--bg-secondary); }
    .canvas-region { flex: 1; }
    .right-panel { width: 360px; border-left: 1px solid var(--border); background: var(--bg-secondary); }
  `]
})
export class DataDesignerComponent implements OnInit {
  service = inject(DataDesignerService);
  projectService = inject(ProjectService);
  route = inject(ActivatedRoute);
  modal = inject(ModalService);

  projectName = signal('Loading Project...');
  projectId: string = '';

  async ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      const project = await this.projectService.getProject(this.projectId);
      this.projectName.set(project.name);
      await this.service.loadEntities(this.projectId);
    }
  }

  async addEntity() {
    const name = await this.modal.show({
      title: 'New Entity',
      message: 'Enter a name for the new data entity (e.g. Employee, Order)',
      type: 'prompt',
      placeholder: 'Entity Name',
      confirmText: 'Create Entity'
    });

    if (name) {
      const newEntity: EntityMetadata = {
        id: `new_${Date.now()}`,
        name,
        fields: [
          { id: `f_${Date.now()}`, name: 'name', type: 'String', label: 'Name', isRequired: true, isUnique: false }
        ],
        relations: [],
        indexes: [],
        icon: 'table_chart'
      };
      await this.service.saveEntity(this.projectId, newEntity);
    }
  }

  async applyChanges() {
    await this.modal.show({
      title: 'Apply Schema Changes',
      message: 'This will generate a new Prisma migration and update your database. Your application services will restart. Proceed?',
      type: 'warning',
      confirmText: 'Generate & Migrate'
    });
    
    // Trigger backend migration engine (to be implemented)
    console.log('Migrating database schema...');
  }
}
