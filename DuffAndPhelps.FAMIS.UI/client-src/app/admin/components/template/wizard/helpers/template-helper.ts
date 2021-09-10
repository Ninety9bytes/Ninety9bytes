import { Template } from '../../../../../_models/template.model';

export class TemplateHelper {

  updateTemplate(values: Object, template: Template): any {
   return (<any>Object).assign(template, values);
  }
}
