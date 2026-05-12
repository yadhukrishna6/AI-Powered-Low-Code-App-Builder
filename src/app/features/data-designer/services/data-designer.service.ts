import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface FieldMetadata {
  id: string;
  name: string;
  type: string;
  label: string;
  description?: string;
  defaultValue?: any;
  isRequired?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  validations?: any;
  metadata?: any;
}

export interface EntityMetadata {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  fields: FieldMetadata[];
  relations: any[];
  indexes: any[];
  auditSettings?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataDesignerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/entities';

  // State Management
  entities = signal<EntityMetadata[]>([]);
  selectedEntityId = signal<string | null>(null);
  selectedFieldId = signal<string | null>(null);
  
  activeEntity = computed(() => 
    this.entities().find(e => e.id === this.selectedEntityId()) || null
  );

  activeField = computed(() => {
    const entity = this.activeEntity();
    if (!entity) return null;
    return entity.fields.find(f => f.id === this.selectedFieldId()) || null;
  });

  async loadEntities(projectId: string) {
    const data = await firstValueFrom(this.http.get<EntityMetadata[]>(`${this.apiUrl}?projectId=${projectId}`));
    this.entities.set(data);
  }

  async saveEntity(projectId: string, entity: EntityMetadata) {
    if (entity.id.startsWith('new_')) {
      const { id, ...data } = entity;
      const created = await firstValueFrom(this.http.post<EntityMetadata>(`${this.apiUrl}?projectId=${projectId}`, data));
      this.entities.update(prev => prev.map(e => e.id === id ? created : e));
      this.selectedEntityId.set(created.id);
    } else {
      await firstValueFrom(this.http.put(`${this.apiUrl}/${entity.id}`, entity));
    }
  }

  addEntity(name: string) {
    const newId = `new_${Date.now()}`;
    const entity: EntityMetadata = {
      id: newId,
      name,
      fields: [
        { id: `f_${Date.now()}`, name: 'id', type: 'UUID', label: 'ID', isRequired: true, isUnique: true, isIndexed: true }
      ],
      relations: [],
      indexes: [],
      icon: 'table_chart'
    };
    this.entities.update(prev => [...prev, entity]);
    this.selectedEntityId.set(newId);
  }

  updateField(entityId: string, field: FieldMetadata) {
    this.entities.update(prev => prev.map(e => {
      if (e.id === entityId) {
        const fields = e.fields.map(f => f.id === field.id ? field : f);
        return { ...e, fields };
      }
      return e;
    }));
  }

  addField(entityId: string) {
    const newField: FieldMetadata = {
      id: `f_${Date.now()}`,
      name: 'newField',
      type: 'Text',
      label: 'New Field'
    };
    this.entities.update(prev => prev.map(e => {
      if (e.id === entityId) {
        return { ...e, fields: [...e.fields, newField] };
      }
      return e;
    }));
    this.selectedFieldId.set(newField.id);
  }
}
