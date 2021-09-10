
import { TemplateModuleField } from './template-module-field.model';

export class TemplateModule {

  constructor(
    public id: string,
    public name: string,
    public moduleFields: Array<TemplateModuleField>
  ) {
  }

}




