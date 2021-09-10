import { TemplateModuleField } from './template-module-field.model';

export interface Module {
  id?: string;
  name?: string;
  moduleFields?: Array<TemplateModuleField>;
}
