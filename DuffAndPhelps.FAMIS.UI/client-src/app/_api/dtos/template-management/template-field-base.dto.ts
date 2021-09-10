export interface TemplateFieldBaseDto {
  id?: string;
  moduleId: string;
  name: string;
  fieldType: string;
  isRequired: boolean;
  order: number;
  isCustomField: boolean;
  moduleFieldId: string;
  value?: string;
  defaultValue?: string;
}