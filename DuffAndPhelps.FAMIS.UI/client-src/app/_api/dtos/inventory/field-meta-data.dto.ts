import { FieldType } from '../../../_enums/field-type';
import { FieldOption } from '../../../_models/field-option.model';
import { CascadedSelectOption } from '../../../_models/cascaded-select-option.model';
import { CascadedSelectValue } from '../../../_models/cascaded-select-value.model';

export interface FieldMetaDataDto {
  name: string;
  displayName: string;
  fieldType: FieldType;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isFacetable: boolean;
  isKey: boolean;
  isCustom: boolean;
  inGridEditable: boolean;
  options?: Array<FieldOption>;
  cascadedValueOptions?: Array<CascadedSelectOption>;
  cascadedValues?: Array<CascadedSelectValue>;
  required?: boolean;
  translationKey?: string;
}
