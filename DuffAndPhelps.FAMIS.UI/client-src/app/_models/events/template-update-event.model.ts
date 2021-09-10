import { TemplateFieldBaseDto } from '../../_api/dtos/template-management/template-field-base.dto';
import { TemplateBaseDto } from '../../_api/dtos/template-management/template-base.dto';

export interface TemplateUpdateEvent {
  selectedModuleIds: Array<string>;
  template: TemplateBaseDto;
  templateFields: Array<TemplateFieldBaseDto>;
}
