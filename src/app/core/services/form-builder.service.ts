import { Injectable, signal, computed } from '@angular/core';
import { FormField, FormSchema, FieldType } from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private schemaSignal = signal<FormSchema>({ fields: [] });
  private selectedFieldIdSignal = signal<string | null>(null);

  // Read-only signals for components
  readonly schema = computed(() => this.schemaSignal());
  readonly selectedFieldId = computed(() => this.selectedFieldIdSignal());
  
  readonly selectedField = computed(() => {
    const id = this.selectedFieldIdSignal();
    return id ? this.schemaSignal().fields.find(f => f.id === id) : null;
  });

  addField(type: FieldType, index?: number) {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      name: `${type}_${Date.now()}`,
      required: false,
      placeholder: `Enter ${type}...`
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
  }

  moveField(previousIndex: number, currentIndex: number) {
    this.schemaSignal.update(s => {
      const fields = [...s.fields];
      const [movedItem] = fields.splice(previousIndex, 1);
      fields.splice(currentIndex, 0, movedItem);
      return { ...s, fields };
    });
  }

  removeField(id: string) {
    this.schemaSignal.update(s => ({
      ...s,
      fields: s.fields.filter(f => f.id !== id)
    }));
    
    if (this.selectedFieldIdSignal() === id) {
      this.selectedFieldIdSignal.set(null);
    }
  }

  updateField(id: string, updates: Partial<FormField>) {
    this.schemaSignal.update(s => ({
      ...s,
      fields: s.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  }

  selectField(id: string | null) {
    this.selectedFieldIdSignal.set(id);
  }

  getSchemaJson(): string {
    return JSON.stringify(this.schemaSignal(), null, 2);
  }
}
