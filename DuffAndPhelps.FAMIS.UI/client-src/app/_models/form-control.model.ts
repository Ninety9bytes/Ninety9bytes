import { BuildingFormCategory } from '../_enums/building-form-category';
import { FieldType } from '../_enums/field-type';
import { FieldOption } from './field-option.model';
import { CascadedSelectOption } from './cascaded-select-option.model';
import { CascadedSelectValue } from './cascaded-select-value.model';

export interface FormControl {
  category: BuildingFormCategory;
  order: number;
  key: string;
  label: string;
  value: string;
  type: FieldType;
  options: FieldOption[];
  cascadedValueOptions?: Array<CascadedSelectOption>;
  cascadedValues?: Array<CascadedSelectValue>;
  validation: boolean;
  clientDataType: string;
  action?: string;
  name?: string;
  readOnly?: boolean;
}

export interface FormControlOption {
  label: string;
  value: any;
}
