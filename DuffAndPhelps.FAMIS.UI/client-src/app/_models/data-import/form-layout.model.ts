import { TemplateFieldBaseDto } from '../../_api/dtos/template-management/template-field-base.dto';

export interface FormLayout {
  moduleId: string;
  customFieldsAvailable: Array<TemplateFieldBaseDto>;
  evenOrderedFields: Array<TemplateFieldBaseDto>;
  oddOrderedFields: Array<TemplateFieldBaseDto>;
  hasSelectedFields: boolean;

}
