export type FieldType = 
  | 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  props?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  layout?: {
    span?: number;
  };
}

export interface FormSchema {
  fields: FormField[];
}

export interface DraggableFieldType {
  type: FieldType;
  icon: string;
  label: string;
  subLabel?: string;
}
