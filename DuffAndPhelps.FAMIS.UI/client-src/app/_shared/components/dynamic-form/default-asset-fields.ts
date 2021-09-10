import { FormField } from '../../../_models/form-field.model';

export const DefaultAssetFields: Array<FormField> = [
  <FormField>{ id: 'buildingId', order: 0 },
  <FormField>{ id: 'assetImages', order: 1 },
  <FormField>{ id: 'floor', order: 2 },
  <FormField>{ id: 'room', order: 3 },
  <FormField>{ id: 'department', order: 4 },
  <FormField>{ id: 'assetTagNumber', order: 5 },
  <FormField>{ id: 'description', order: 6 },
  <FormField>{ id: 'manufacturer', order: 7 },
  <FormField>{ id: 'modelNumber', order: 8 },
  <FormField>{ id: 'serialNumber', order: 9 },
  <FormField>{ id: 'quantity', order: 10 },
  <FormField>{ id: 'acquisitionDate', order: 11 },
  <FormField>{ id: 'historicalCost', order: 12 },
  <FormField>{ id: 'assetClass', order: 13 },
  <FormField>{ id: 'costReplacementNew', order: 14 }
];
