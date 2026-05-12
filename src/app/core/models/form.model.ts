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
  stepId?: string;
  visibilityRules?: {
    fieldId: string;
    operator: '==' | '!=' | 'contains' | 'empty' | 'not_empty';
    value: any;
  }[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
}

export interface FormSchema {
  fields: FormField[];
  steps?: FormStep[];
  layout?: any;
}

export interface DraggableFieldType {
  type: FieldType;
  icon: string;
  label: string;
  subLabel?: string;
}
