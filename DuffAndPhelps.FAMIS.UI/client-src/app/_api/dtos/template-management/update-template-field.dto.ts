import { TemplateFieldBaseDto } from './template-field-base.dto';

export interface UpdateTemplateFieldDto extends TemplateFieldBaseDto {
  id: string;
  templateId: string;
}
