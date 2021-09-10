import { FormField } from '../../../../../../_models/form-field.model';
import { FieldType } from '../../../../../../_enums/field-type';

export const PrimaryInfoDropDownModel = [
  {
    id: '109',
    order: 5,
    displayName: 'Unit of Measure',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'unitOfMeasure'
  },

  <FormField>{
    id: '110',
    order: 24,
    displayName: 'Basement Construction Class',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'basementConstructionClass'
  },

  <FormField>{
    id: '111',
    order: 25,
    displayName: 'Basement Occupancy Code',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'basementOccupancyCode'
  },

  <FormField>{
    id: '108',
    order: 45,
    displayName: 'Entry Alarm',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'entryAlarm'
  },

  <FormField>{
    id: '112',
    order: 58,
    displayName: 'Degree Slope',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'degreeSlope'
  },
  <FormField>{
    id: '113',
    order: 59,
    displayName: 'Site Position',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'sitePosition'
  },
  <FormField>{
    id: '115',
    order: 60,
    displayName: 'Soil Condition',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'soilCondition'
  },
  <FormField>{
    id: '114',
    order: 61,
    displayName: 'Site Accessibility',
    value: null,
    required: false,
    type: FieldType.DropDown,
    name: 'siteAccessibility'
  }
];
