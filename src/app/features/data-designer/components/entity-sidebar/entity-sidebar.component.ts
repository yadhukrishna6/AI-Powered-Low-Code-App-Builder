import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataDesignerService, FieldMetadata } from '../../services/data-designer.service';

@Component({
  selector: 'app-entity-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sidebar-container" *ngIf="service.activeEntity() as entity">
      <div class="sidebar-header">
        <h2>Entity Properties</h2>
        <button class="btn-icon" (click)="service.selectedEntityId.set(null)">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="sidebar-section">
        <label>Entity Name</label>
        <input type="text" [(ngModel)]="entity.name" (blur)="save()" class="form-input">
        
        <label>Description</label>
        <textarea [(ngModel)]="entity.description" (blur)="save()" class="form-input" rows="2"></textarea>
      </div>

      <div class="sidebar-section">
        <div class="section-title">
          <h3>Fields</h3>
          <button class="btn-add-field" (click)="addField()">
            <span class="material-icons">add</span>
          </button>
        </div>

        <div class="fields-list">
          <div *ngFor="let field of entity.fields; let i = index" class="field-item">
            <div class="field-main">
              <input type="text" [(ngModel)]="field.name" (blur)="save()" placeholder="Field Name">
              <select [(ngModel)]="field.type" (change)="save()">
                <option value="String">String</option>
                <option value="Int">Int</option>
                <option value="Boolean">Boolean</option>
                <option value="DateTime">DateTime</option>
                <option value="Relation">Relation</option>
              </select>
              <button class="btn-delete-field" (click)="removeField(i)">
                <span class="material-icons">delete</span>
              </button>
            </div>
            <div class="field-options">
              <label><input type="checkbox" [(ngModel)]="field.isRequired" (change)="save()"> Required</label>
              <label><input type="checkbox" [(ngModel)]="field.isUnique" (change)="save()"> Unique</label>
            </div>
          </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-danger-link" (click)="deleteEntity()">Delete Entity</button>
      </div>
    </div>

    <div class="empty-state" *ngIf="!service.activeEntity()">
      <span class="material-icons">info</span>
      <p>Select an entity to edit its properties</p>
    </div>
  `,
  styles: [`
    .sidebar-container { height: 100%; display: flex; flex-direction: column; }
    .sidebar-header {
      padding: 1.25rem; border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
    }
    .sidebar-header h2 { font-size: 0.9rem; font-weight: 700; margin: 0; text-transform: uppercase; }

    .sidebar-section { padding: 1.5rem; border-bottom: 1px solid var(--border); }
    .sidebar-section label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; }
    
    .form-input {
      width: 100%; padding: 0.6rem 0.8rem; border: 1px solid var(--border);
      border-radius: 8px; background: var(--bg-primary); color: var(--text-primary);
      font-size: 0.85rem; margin-bottom: 1rem;
    }

    .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .section-title h3 { font-size: 0.85rem; font-weight: 700; margin: 0; }

    .fields-list { display: flex; flex-direction: column; gap: 1rem; }
    .field-item { padding: 0.75rem; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 10px; }
    
    .field-main { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
    .field-main input { flex: 1; background: transparent; border: none; font-size: 0.85rem; font-weight: 600; }
    .field-main select { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; font-size: 0.75rem; }

    .field-options { display: flex; gap: 1rem; }
    .field-options label { margin: 0; display: flex; align-items: center; gap: 4px; cursor: pointer; }

    .btn-add-field { background: #a78bfa; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
    .btn-delete-field { color: var(--text-secondary); opacity: 0.5; }
    .btn-delete-field:hover { color: #ef4444; opacity: 1; }

    .sidebar-footer { padding: 1.5rem; margin-top: auto; }
    .btn-danger-link { color: #ef4444; font-size: 0.8rem; font-weight: 600; text-decoration: underline; }

    .empty-state {
      height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 2rem; text-align: center; color: var(--text-secondary);
    }
    .empty-state .material-icons { font-size: 3rem; margin-bottom: 1rem; opacity: 0.3; }
  `]
})
export class EntitySidebarComponent {
  service = inject(DataDesignerService);

  save() {
    const entity = this.service.activeEntity();
    const projectId = (this.service as any).projectId; // Temporary or get from route
    if (entity && projectId) this.service.saveEntity(projectId, entity);
  }

  addField() {
    const entity = this.service.activeEntity();
    if (entity) {
      this.service.addField(entity.id);
    }
  }

  removeField(index: number) {
    const entity = this.service.activeEntity();
    if (entity) {
      entity.fields.splice(index, 1);
      this.save();
    }
  }

  async deleteEntity() {
    const entity = this.service.activeEntity();
    if (entity && confirm(`Are you sure you want to delete ${entity.name}?`)) {
      // await this.service.deleteEntity(entity.id!);
      console.log('Delete entity', entity.id);
    }
  }
}
