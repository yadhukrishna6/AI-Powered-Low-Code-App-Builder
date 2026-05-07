import { Injectable, signal, computed, inject } from '@angular/core';
import { FormField, FormSchema } from '../models/form.model';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {
  private modal = inject(ModalService);

  // Current form state
  formFields = signal<FormField[]>([
    {
      id: 'empName',
      type: 'text',
      label: 'Employee Name',
      name: 'empName',
      required: true,
      placeholder: 'Enter full name'
    },
    {
      id: 'leaveType',
      type: 'select',
      label: 'Leave Type',
      name: 'leaveType',
      required: true,
      options: ['Sick Leave', 'Casual Leave', 'Vacation', 'Emergency Leave']
    },
    {
      id: 'startDate',
      type: 'date',
      label: 'Start Date',
      name: 'startDate',
      required: true
    },
    {
      id: 'endDate',
      type: 'date',
      label: 'End Date',
      name: 'endDate',
      required: true
    },
    {
      id: 'totalDays',
      type: 'number',
      label: 'Total Days',
      name: 'totalDays',
      required: false,
      defaultValue: 0,
      readonly: true
    },
    {
      id: 'reason',
      type: 'textarea',
      label: 'Reason for Leave',
      name: 'reason',
      required: false,
      placeholder: 'Please provide a reason...'
    }
  ]);

  layout = signal<any>({
    columns: 12,
    gap: 20
  });

  selectedFieldId = signal<string | null>(null);
  canvasMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
  isSaving = signal(false);

  selectedField = computed(() => 
    this.formFields().find(f => f.id === this.selectedFieldId()) || null
  );

  // For compatibility with older code
  schema = computed(() => ({
    fields: this.formFields(),
    layout: this.layout()
  }));

  // Actions
  addField(type: any, position?: number) {
    let label = `New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    let placeholder = 'Enter value...';
    let options: string[] = [];

    if (type === 'header') {
      label = 'Section Title';
      placeholder = '';
    } else if (type === 'paragraph') {
      label = 'Description text';
      placeholder = 'Add your descriptive text here...';
    } else if (['select', 'radio'].includes(type)) {
      options = ['Option 1', 'Option 2'];
    }

    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label,
      name: type + '_' + Date.now(),
      required: false,
      placeholder,
      options
    };

    this.formFields.update(fields => {
      if (position !== undefined) {
        const newFields = [...fields];
        newFields.splice(position, 0, newField);
        return newFields;
      }
      return [...fields, newField];
    });

    this.selectedFieldId.set(newField.id);
  }

  duplicateField(fieldId: string) {
    const field = this.formFields().find(f => f.id === fieldId);
    if (!field) return;

    const newField = { ...JSON.parse(JSON.stringify(field)), id: crypto.randomUUID(), name: field.name + '_copy' };
    const index = this.formFields().findIndex(f => f.id === fieldId);
    
    this.formFields.update(fields => {
      const newFields = [...fields];
      newFields.splice(index + 1, 0, newField);
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
    if (this.selectedFieldId() === fieldId) {
      this.selectedFieldId.set(null);
    }
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
  }

  // Persistance (Simulated DB)
  async saveForm(name: string) {
    this.isSaving.set(true);
    await new Promise(r => setTimeout(r, 1000));
    const schema = this.exportFormSchema();
    localStorage.setItem(`form_${name}`, JSON.stringify(schema));
    this.isSaving.set(false);
    return true;
  }

  async loadForms() {
    const forms = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('form_')) {
        forms.push({ id: key, name: key.replace('form_', '') });
      }
    }
    return forms;
  }

  async loadForm(id: string) {
    const data = localStorage.getItem(id);
    if (data) {
      this.loadFormSchema(JSON.parse(data));
    }
  }

  loadProjectSchema(schema: any) {
    this.loadFormSchema(schema);
  }

  generateFromPrompt(prompt: string) {
    console.log('AI Generation requested for:', prompt);
    return Promise.resolve(true);
  }

  getSchemaJson() {
    return JSON.stringify(this.exportFormSchema(), null, 2);
  }

  // History (Simulated)
  undo() { console.log('Undo'); }
  redo() { console.log('Redo'); }

  // Serialization
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
}
