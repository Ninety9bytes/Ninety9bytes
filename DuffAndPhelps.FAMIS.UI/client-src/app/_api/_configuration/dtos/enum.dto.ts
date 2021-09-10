import { EnumOptionDto } from './enum-option.dto';

export interface EnumDto {
  enumName: string;
  enumOptions: EnumOptionDto[];
}
