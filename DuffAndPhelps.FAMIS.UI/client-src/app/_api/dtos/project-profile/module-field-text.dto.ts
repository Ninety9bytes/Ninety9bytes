import {ModuleFieldBaseDto} from './module-field-base.dto';

export interface ModuleFieldTextDto extends ModuleFieldBaseDto {
  value: string;
  isMultiline: boolean;
  maxChars: number;
}
