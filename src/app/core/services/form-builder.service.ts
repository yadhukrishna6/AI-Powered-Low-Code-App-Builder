import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormField, FormSchema, FieldType } from '../models/form.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/forms';
  
  private schemaSignal = signal<FormSchema>({ fields: [] });
  private selectedFieldIdSignal = signal<string | null>(null);
  private isSavingSignal = signal<boolean>(false);
  
  private themeSignal = signal<'light' | 'dark'>('light');
  private canvasModeSignal = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  private history: FormSchema[] = [];
  private historyIndex = -1;

  readonly schema = computed(() => this.schemaSignal());
  readonly selectedFieldId = computed(() => this.selectedFieldIdSignal());
  readonly isSaving = computed(() => this.isSavingSignal());
  readonly theme = computed(() => this.themeSignal());
  readonly canvasMode = computed(() => this.canvasModeSignal());
  
  readonly allDropListIds = computed(() => ['canvas-root']);

  readonly selectedField = computed(() => {
    const id = this.selectedFieldIdSignal();
    if (!id) return null;
    return this.schemaSignal().fields.find(f => f.id === id) || null;
  });

  constructor() {
    this.saveToHistory();
  }

  setTheme(theme: 'light' | 'dark') {
    this.themeSignal.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }

  setCanvasMode(mode: 'desktop' | 'tablet' | 'mobile') {
    this.canvasModeSignal.set(mode);
  }

  clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
      this.schemaSignal.set({ fields: [] });
      this.selectField(null);
      this.saveToHistory();
    }
  }

  private saveToHistory() {
    const currentSchema = JSON.parse(JSON.stringify(this.schemaSignal()));
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(currentSchema);
    this.historyIndex++;
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.schemaSignal.set(JSON.parse(JSON.stringify(this.history[this.historyIndex])));
      this.selectField(null);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.schemaSignal.set(JSON.parse(JSON.stringify(this.history[this.historyIndex])));
      this.selectField(null);
    }
  }

  addField(type: FieldType, index?: number) {
    let label = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    let placeholder = `Enter ${type}...`;
    let props: any = {};

    if (type === 'header') {
      label = 'Section Title';
      placeholder = '';
    } else if (type === 'paragraph') {
      label = 'Description text';
      placeholder = 'Add your descriptive text here...';
    } else if (type === 'rating') {
      props = { max: 5 };
    } else if (type === 'slider') {
      props = { min: 0, max: 100, step: 1 };
    } else if (['select', 'radio'].includes(type)) {
      props = { options: ['Option 1', 'Option 2'] };
    }

    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label,
      name: `${type}_${Date.now()}`,
      required: false,
      placeholder,
      props,
      layout: { span: 12 }
    };

    this.schemaSignal.update(s => {
      const fields = [...s.fields];
      if (index !== undefined) {
        fields.splice(index, 0, newField);
      } else {
        fields.push(newField);
      }
      return { ...s, fields };
    });

    this.selectField(newField.id);
    this.saveToHistory();
  }

  updateField(id: string, updates: Partial<FormField>) {
    this.schemaSignal.update(s => {
      const fields = s.fields.map(f => f.id === id ? { ...f, ...updates } : f);
      return { ...s, fields };
    });
    this.saveToHistory();
  }

  removeField(id: string) {
    this.schemaSignal.update(s => {
      const fields = s.fields.filter(f => f.id !== id);
      return { ...s, fields };
    });
    if (this.selectedFieldIdSignal() === id) {
      this.selectField(null);
    }
    this.saveToHistory();
  }

  moveField(previousIndex: number, currentIndex: number) {
    this.schemaSignal.update(s => {
      const fields = [...s.fields];
      const [movedItem] = fields.splice(previousIndex, 1);
      fields.splice(currentIndex, 0, movedItem);
      return { ...s, fields };
    });
    this.saveToHistory();
  }

  duplicateField(id: string) {
    this.schemaSignal.update(s => {
      const fieldIndex = s.fields.findIndex(f => f.id === id);
      if (fieldIndex === -1) return s;

      const fieldToClone = s.fields[fieldIndex];
      const clonedField: FormField = {
        ...JSON.parse(JSON.stringify(fieldToClone)),
        id: crypto.randomUUID(),
        name: `${fieldToClone.name}_copy_${Date.now()}`,
        label: `${fieldToClone.label} (Copy)`
      };

      const fields = [...s.fields];
      fields.splice(fieldIndex + 1, 0, clonedField);
      return { ...s, fields };
    });
    this.saveToHistory();
  }

  selectField(id: string | null) {
    this.selectedFieldIdSignal.set(id);
  }

  getSchemaJson(): string {
    return JSON.stringify(this.schemaSignal(), null, 2);
  }

  async saveForm(name: string) {
    this.isSavingSignal.set(true);
    try {
      const payload = { name, schema: this.schemaSignal() };
      const response = await firstValueFrom(this.http.post(this.apiUrl, payload));
      return response;
    } catch (error) {
      console.error('Error saving form:', error);
      throw error;
    } finally {
      this.isSavingSignal.set(false);
    }
  }

  async loadForms() {
    try {
      return await firstValueFrom(this.http.get<any[]>(this.apiUrl));
    } catch (error) {
      console.error('Error loading forms:', error);
      return [];
    }
  }

  async loadForm(id: string) {
    try {
      const form = await firstValueFrom(this.http.get<any>(`${this.apiUrl}/${id}`));
      this.schemaSignal.set(form.schema);
      this.selectField(null);
      return form;
    } catch (error) {
      console.error('Error loading form:', error);
    }
  }
}
