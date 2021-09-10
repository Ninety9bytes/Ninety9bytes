import { FieldType } from '../../../_enums/field-type';

export const FileHeaders = [
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
  },
  {
      name: 'fileSize',
      displayName: 'Size',
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
      name: 'userName',
      displayName: 'User Id',
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
      name: 'uploadDate',
      displayName: 'Upload Date',
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
      name: 'isPortalDocument',
      displayName: 'Is Portal Document',
      fieldType: FieldType.String,
      isCustom: false,
      isFacetable: false,
      isKey: false,
      isSearchable: true,
      isFilterable: true,
      isSortable: true,
      isEditable: false,
  },
  {
      name: 'uploadTypeName',
      displayName: 'Upload Target',
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
