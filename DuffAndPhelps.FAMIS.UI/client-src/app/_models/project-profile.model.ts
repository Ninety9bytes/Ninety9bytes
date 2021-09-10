import { ModuleDto } from '../_api/_configuration/dtos/module.dto';
import { TemplateBaseDto } from '../_api/_configuration/dtos/template-base.dto';

export interface ProjectProfile {
  selectedGroupId: string;
  selectedModule: string;
  template: TemplateBaseDto;
  modules: Array<ModuleDto>;
  enabledModules: Array<ModuleDto>;
}