import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { FieldType } from '../../_enums/field-type';

export const customAdditionsHeaders: Array<GridColumnHeader> = [
  {
    name: 'description',
    order: 1,
    displayName: 'Description',
    fieldType: FieldType.String,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false,
  },
  {
    name: 'cost',
    order: 2,
    displayName: 'Cost',
    fieldType: FieldType.String,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false,
  }
];
