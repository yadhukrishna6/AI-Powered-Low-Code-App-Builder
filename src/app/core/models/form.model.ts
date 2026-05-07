export type FieldType = 
  | 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'file'
  | 'password' | 'date' | 'time' | 'switch' | 'slider' | 'rating' | 'header' | 'paragraph';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: any;
  readonly?: boolean;
  options?: string[]; // Added for convenience in select/radio
  props?: any;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  layout?: {
    span?: number;
  };
}

export interface FormSchema {
  fields: FormField[];
  layout?: any;
}

export interface DraggableFieldType {
  type: FieldType;
  icon: string;
  label: string;
  subLabel?: string;
}
