import { TemplateBaseDto } from './template-base.dto';
import { CreateTemplateFieldDto } from './create-template-field.dto';

export interface CreateTemplateDto extends TemplateBaseDto {
  templateFields:Array<CreateTemplateFieldDto>;
  name:string;
  isMasterTemplate:boolean;
  isRetired:boolean;
  sourceTemplateId:string;
}