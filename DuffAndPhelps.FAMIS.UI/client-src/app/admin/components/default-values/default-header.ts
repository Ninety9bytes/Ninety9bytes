import { FieldType } from '../../../_enums/field-type';

export const groupSaveHeaders = [
  {
    name: 'id',
    displayName: 'Id',
    fieldType: FieldType.String,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false
  },
  {
    name: 'groupId',
    displayName: 'Group Id',
    fieldType: FieldType.String,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false
  },
  {
    name: 'updatedUserName',
    displayName: 'Created by',
    fieldType: FieldType.String,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false
  },
  {
    name: 'createdTime',
    displayName: 'Date & Time',
    fieldType: FieldType.DateWithTimeStamp,
    isSearchable: false,
    isFilterable: false,
    isSortable: false,
    isFacetable: false,
    isKey: false,
    isCustom: false
  },
  {
    name: 'description',
    displayName: 'Name',
    fieldType: FieldType.String,
    isSearchable: true,
    isFilterable: true,
    isSortable: false,
    isFacetable: false,
    isKey: true,
    isCustom: false
  },
];

export const defaultGroupSaveHeaders = [
  'description',
  'createdTime',
  'updatedUserName'
];

