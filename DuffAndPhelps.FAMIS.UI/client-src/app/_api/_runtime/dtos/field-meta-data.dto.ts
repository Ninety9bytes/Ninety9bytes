import { FieldType } from '../enums/field-type';

export interface FieldMetaDataDto {
  name: string;
  displayName: string;
  fieldType: FieldType;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isFacetable: boolean;
  inGridEditable: boolean;
  isKey: boolean;
  isCustom: boolean;
}

export interface IndexModelMetadata {
  name: string;
  id?: string;
  fields: Array<FieldMetaDataDto>;
}
