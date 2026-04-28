export interface FormField {
  type: 'text' | 'email' | 'date';
  label: string;
  name: string;
  required?: boolean;
}

export interface FormSchema {
  fields: FormField[];
}
