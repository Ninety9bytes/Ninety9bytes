import { FieldType } from '../../../../../_enums/field-type';

export const userFactorFormModel = [
  {
    name: 'description',
    displayName: 'Description',
    fieldType: 0,
    required: true,
  },
  {
    name: 'factor',
    displayName: 'Factor',
    fieldType: FieldType.Double,
    required: true
  },
];
