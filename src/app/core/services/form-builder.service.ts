import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormField, FormSchema } from '../models/form.model';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private http = inject(HttpClient);
  private modal = inject(ModalService);
  private apiUrl = 'http://localhost:3000/api/v1/forms';

  // Current form state
  formFields = signal<FormField[]>([]);
  layout = signal<any>({ columns: 12, gap: 20 });
  selectedFieldId = signal<string | null>(null);
  canvasMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  isSaving = signal(false);
  currentProjectId = signal<string | null>(null);

  selectedField = computed(() => 
    this.formFields().find(f => f.id === this.selectedFieldId()) || null
  );

  schema = computed(() => ({
    fields: this.formFields(),
    layout: this.layout()
  }));

  // Actions
  async loadForms() {
    try {
      const forms = await firstValueFrom(this.http.get<any[]>(this.apiUrl));
      return forms.map(f => ({ id: f.id, name: f.name }));
    } catch (e) {
      console.error('Failed to load forms:', e);
      return [];
    }
  }

  async loadForm(id: string) {
    try {
      const form = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      if (form && form.schema) {
        this.loadFormSchema(form.schema);
      }
    } catch (e) {
      console.error('Failed to load form:', e);
    }
  }

  async saveForm(name: string) {
    this.isSaving.set(true);
    try {
      const payload = {
        name,
        schema: this.exportFormSchema(),
        projectId: this.currentProjectId()
      };
      await firstValueFrom(this.http.post(this.apiUrl, payload));
      this.isSaving.set(false);
      return true;
    } catch (e) {
      console.error('Failed to save form:', e);
      this.isSaving.set(false);
      return false;
    }
  }

  addField(type: any, position?: number) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type}`,
      name: `${type}_${Date.now()}`,
      required: false,
      placeholder: 'Enter value...'
    };

    this.formFields.update(fields => {
      const newFields = [...fields];
      if (position !== undefined) newFields.splice(position, 0, newField);
      else newFields.push(newField);
      return newFields;
    });
    this.selectedFieldId.set(newField.id);
  }

  updateField(fieldId: string, updates: Partial<FormField>) {
    this.formFields.update(fields => 
      fields.map(f => f.id === fieldId ? { ...f, ...updates } : f)
    );
  }

  removeField(fieldId: string) {
    this.formFields.update(fields => fields.filter(f => f.id !== fieldId));
  }

  moveField(oldIndex: number, newIndex: number) {
    this.formFields.update(fields => {
      const newFields = [...fields];
      const [removed] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, removed);
      return newFields;
    });
  }

  selectField(fieldId: string | null) {
    this.selectedFieldId.set(fieldId);
  }

  setCanvasMode(mode: 'desktop' | 'tablet' | 'mobile') {
    this.canvasMode.set(mode);
  }

  clearCanvas() {
    this.formFields.set([]);
    this.selectedFieldId.set(null);
    this.layout.set({ columns: 12, gap: 20 });
  }

  exportFormSchema() {
    return {
      fields: this.formFields(),
      layout: this.layout()
    };
  }

  loadFormSchema(schema: any) {
    if (schema.fields) this.formFields.set(schema.fields);
    if (schema.layout) this.layout.set(schema.layout);
  }

  loadProjectSchema(schema: any) {
    this.loadFormSchema(schema);
  }

  duplicateField(fieldId: string) {
    const field = this.formFields().find(f => f.id === fieldId);
    if (!field) return;
    const copy = { ...JSON.parse(JSON.stringify(field)), id: crypto.randomUUID(), name: field.name + '_copy' };
    const idx = this.formFields().findIndex(f => f.id === fieldId);
    this.formFields.update(fields => {
      const arr = [...fields];
      arr.splice(idx + 1, 0, copy);
      return arr;
    });
    this.selectedFieldId.set(copy.id);
  }

  generateFromPrompt(prompt: string) {
    console.log('AI Generation requested for:', prompt);
    return Promise.resolve(true);
  }

  getSchemaJson() {
    return JSON.stringify(this.exportFormSchema(), null, 2);
  }

  undo() { console.log('Undo'); }
  redo() { console.log('Redo'); }
}
