import { ModuleFieldBaseDto } from './module-field-base.dto';

export interface ModuleFieldWholeNumberDto extends ModuleFieldBaseDto{
  value: number;
  min: number;
  max: number; 
}