import { TemplateFieldBaseDto } from './template-field-base.dto';
import { UpdateTemplateFieldDto } from './update-template-field.dto';

export interface UpdateTemplateDto extends TemplateFieldBaseDto {
  id: string;
  templateFields: Array<UpdateTemplateFieldDto>;
}
