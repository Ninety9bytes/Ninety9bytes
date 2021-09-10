import { EnumOptionDto } from '../_api/_configuration/dtos/enum-option.dto';

export interface GridColumnHeader {
  name: string;
  order?: number;
  displayName: string;
  fieldType: number | string;
  isSearchable: boolean;
  isFilterable: boolean;
  isSortable: boolean;
  isFacetable: boolean;
  isKey: boolean;
  isCustom: boolean;
  isEditable: boolean;
  format?: string;
  width?: string;
  enumOptions?: Array<EnumOptionDto>;
  isNullable?: boolean;
}
