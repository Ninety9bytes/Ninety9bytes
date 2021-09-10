import {ModuleFieldBaseDto} from './module-field-base.dto';

export interface ModuleFieldDropdownDto extends ModuleFieldBaseDto{
  value: ModuleFieldDropdownItemDto;
  defaultValue: ModuleFieldDropdownItemDto;
  values: ModuleFieldDropdownItemDto[];
}

export interface ModuleFieldDropdownItemDto{
  value: string;
  text: string;
}