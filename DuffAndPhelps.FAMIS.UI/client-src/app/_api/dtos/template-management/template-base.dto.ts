import { TemplateFieldBaseDto } from './template-field-base.dto';

export interface TemplateBaseDto {
  id?:string;
  officeId:string,
  officeName: string,
  lastUsed: string,
  name:string,
  isMasterTemplate:boolean;
  isRetired:boolean;
  sourceTemplateId:string;
  templateFields: Array<TemplateFieldBaseDto>;
}