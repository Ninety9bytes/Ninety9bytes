import { TemplateBaseDto } from '../../_api/_configuration/dtos/template-base.dto';
import { TemplateFieldBaseDto } from '../../_api/dtos/template-management/template-field-base.dto';

export interface MatchCodeUpdatedEvent {
  selectedModuleIds: Array<string>;
  template: TemplateBaseDto;
  templateFields: Array<TemplateFieldBaseDto>;
}
