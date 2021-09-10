import { ModuleDto } from '../../_api/_configuration/dtos/module.dto';
import { TemplateBaseDto } from '../../_api/_configuration/dtos/template-base.dto';

export interface TemplateWizard {
  selectedModules: Array<ModuleDto>;
  selectedModuleIds: Array<string>;
  template: TemplateBaseDto;
}
