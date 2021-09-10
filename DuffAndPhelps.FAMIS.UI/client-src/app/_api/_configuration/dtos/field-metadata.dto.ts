import { FieldType } from '../../../_enums/field-type';

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
  order?: number;
  isNullable?: boolean;
}
