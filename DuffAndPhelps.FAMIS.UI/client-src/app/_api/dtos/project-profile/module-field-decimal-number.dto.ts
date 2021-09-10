import { ModuleFieldWholeNumberDto } from './module-field-whole-number.dto';

export interface ModuleFieldDecimalNumberDto extends ModuleFieldWholeNumberDto{
  decimalPlaces: number;
}