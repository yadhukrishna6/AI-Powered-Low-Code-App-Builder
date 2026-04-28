export type FieldType = 'text' | 'email' | 'date';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
}

export interface FormSchema {
  fields: FormField[];
}

export interface DraggableFieldType {
  type: FieldType;
  icon: string;
  label: string;
}
