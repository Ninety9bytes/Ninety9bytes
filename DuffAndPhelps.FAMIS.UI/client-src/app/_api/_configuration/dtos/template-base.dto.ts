import { TemplateFieldBaseDto } from '../../dtos/template-management/template-field-base.dto';

export interface TemplateBaseDto {
  id?: string;
  countryId: string;
  countryName: string;
  lastUsed: string;
  name: string;
  isMasterTemplate: boolean;
  isRetired: boolean;
  sourceTemplateId: string;
  templateFields: Array<TemplateFieldBaseDto>;
}
