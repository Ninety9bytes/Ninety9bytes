import { FieldType } from '../../_enums/field-type';

export const recipientFormModel = [
  {
    name: 'recipientName',
    displayName: 'Recipient Name',
    fieldType: FieldType.String,
    required: true,
  },
  {
    name: 'address',
    displayName: 'Address',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'address2',
    displayName: 'Address2',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'city',
    displayName: 'City',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'state',
    displayName: 'State',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'zip',
    displayName: 'Zip',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'email',
    displayName: 'Email',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'phoneNumber',
    displayName: 'Phone Number',
    fieldType: FieldType.String,
    required: false,
  },
  {
    name: 'deliverables',
    displayName: 'Deliverables',
    fieldType: FieldType.DropDown,
    options: [
      {
        displayName: 'Portal',
        key: 0
      },
      {
        displayName: 'Hard Copy',
        key: 1
      },
      {
        displayName: 'Both',
        key: `0, 1`
      }
    ],
    required: true,
  }
];
