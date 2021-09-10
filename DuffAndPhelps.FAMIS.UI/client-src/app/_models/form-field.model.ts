import { FieldOption } from './field-option.model';
import { CascadedSelectOption } from './cascaded-select-option.model';
import { CascadedSelectValue } from './cascaded-select-value.model';
import { FieldCategory } from '../_enums/field-category';
import { FieldType } from '../_enums/field-type';

export interface FormField {
  id?: string;
  type: FieldType;
  value?: any;
  order?: number;
  min?: number;
  displayName: string;
  required: boolean;
  options?: Array<FieldOption>;
  optionsKey?: string;
  isReadOnly?: boolean;
  cascadedValueOptions?: Array<CascadedSelectOption>;
  cascadedValues?: Array<CascadedSelectValue>;
  cascadedValueIndex?: number;
  fieldCategory?: FieldCategory;
  addItemLabel?: string;
  attributeTypeId?: number;
  name?: string;
  format?: string;
  decimalLength?: number;
  translationKey?: string;
}
