export interface ModuleFieldBaseDto {
  fieldName: string;
  fieldLabel: string;
  helpText: string;
  order: number;
  isReadOnly: boolean;
  isCustomField: boolean;
  isRequired: boolean;
  templateFieldId: string;
  moduleId: string;
  type: string;
}
