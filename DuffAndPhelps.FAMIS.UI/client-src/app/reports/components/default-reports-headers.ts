import { FieldType } from '../../_enums/field-type';

export const reportsHeaders = [
  {
    name: 'reportName',
    displayName: 'Report Name',
    fieldType: FieldType.String,
    isCustom: false,
    isFacetable: false,
    isKey: false,
    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isEditable: false
  },
  {
    name: 'requestedDateTime',
    displayName: 'Requested Date',
    fieldType: FieldType.DateTime,
    isCustom: false,
    isFacetable: false,
    isKey: false,
    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isEditable: false
  },
  {
    name: 'status',
    displayName: 'Status',
    fieldType: FieldType.String,
    isCustom: false,
    isFacetable: false,
    isKey: false,
    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isEditable: false
  },
  {
    name: 'fileName',
    displayName: 'File Name',
    fieldType: FieldType.String,
    isCustom: false,
    isFacetable: false,
    isKey: false,
    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isEditable: false
  }
];
