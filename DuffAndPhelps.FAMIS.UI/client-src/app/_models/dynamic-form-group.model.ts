import { FormField } from './form-field.model';
export interface DynamicFormGroup {
  id: number;
  displayName: string;
  order: number;
  fields: Array<FormField>;
  action: string;
  isOneToMany: boolean;
  value: number;
}