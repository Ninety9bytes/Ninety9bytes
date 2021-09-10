import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { FieldType } from '../../_enums/field-type';

export const defaultDepreciationHeaders = [
  'displayId',
  'description',
  'historicalCost',
  'DepreciationBasis',
  'DepreciationConvention',
  'DepreciationAsOfDate',
  'acquisitionDate',
  'AccumulatedDepreciation',
  'PeriodDepreciation',
  'LifeMonths'
];

export const defaultTrendingHeaders = [
  'displayId',
  'description',
  'acquisitionDate',
  'assetClass',
  'sourceField',
  'sourceFieldValue',
  'trendIndex',
  'destinationField',
  'originalValue',
  'newValue',
  'percentChange'
];

export const errorColumn = [
  <GridColumnHeader>{
    name: 'ValidationErrors',
    order: 0,
    displayName: 'Error',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  }
];

export const trendingErrorColumn = [
  <GridColumnHeader>{
    name: 'processingErrorDescription',
    order: 0,
    displayName: 'Error',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  }
];

export const depreciationHeaders = [
  {
    name: 'displayId',
    displayName: 'Display Id',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'description',
    displayName: 'Description',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'historicalCost',
    displayName: 'Historical Cost',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'DepreciationBasis',
    displayName: 'Basis',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'DepreciationConvention',
    displayName: 'Convention',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'DepreciationAsOfDate',
    displayName: 'As of Date',
    fieldType: FieldType.DateTime,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'DepreciationMethod',
    displayName: 'Method',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },

  {
    name: 'AccumulatedDepreciation',
    displayName: 'Accumulated Depreciation',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },

  {
    name: 'PeriodDepreciation',
    displayName: 'Period Depreciation',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },

  {
    name: 'LifeMonths',
    displayName: 'Life Months',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  }
];

export const trendingHeaders = [
  {
    name: 'displayId',
    displayName: 'Display Id',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'description',
    displayName: 'Description',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'acquisitionDate',
    displayName: 'Acquisition Date',
    fieldType: FieldType.DateTime,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'trendIndex',
    displayName: 'Trend Index',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'sourceField',
    displayName: 'Start Field',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'sourceFieldValue',
    displayName: 'Start Field Value',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'destinationField',
    displayName: 'Ending Field',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'originalValue',
    displayName: 'Current Ending Value',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'newValue',
    displayName: 'New Ending Value',
    fieldType: FieldType.Double,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'percentChange',
    displayName: 'Percentage of Change',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  }
];

export const assetFileRecordHeaders = [
  {
    name: 'assetTagNumber',
    displayName: 'Asset Tag Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'oldTagNumber',
    displayName: 'Old Tag Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'activityCode',
    displayName: 'Activity Code',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'property',
    displayName: 'Property',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'floor',
    displayName: 'Floor',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'room',
    displayName: 'Room',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'locationInPlant',
    displayName: 'Location In Plant',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'department',
    displayName: 'Department Name',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'classCode',
    displayName: 'Class Code',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'assetClass',
    displayName: 'Asset Classification',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'gLAssetAccount',
    displayName: 'GL Asset Account',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'gLAccumAccount',
    displayName: 'GL Accum Account',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'fundingSource',
    displayName: 'Funding Source',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'quantity',
    displayName: 'Quantity',
    fieldType: FieldType.Double,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'description2',
    displayName: 'Description 2',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'description3',
    displayName: 'Description 3',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'manufacturer',
    displayName: 'Manufacturer',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'modelNumber',
    displayName: 'Model Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'faceDescription',
    displayName: 'Face Description',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'serialNumber',
    displayName: 'Serial Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'acquisitionDate',
    displayName: 'Acquisition Date',
    fieldType: FieldType.DateTime,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'functionActivity',
    displayName: 'Function Activity',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'plant',
    displayName: 'Plant',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'city',
    displayName: 'City',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'purchaseOrder',
    displayName: 'Purchase Order',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'invoiceNumber',
    displayName: 'Invoice Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'vendor',
    displayName: 'Vendor',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'propertyType',
    displayName: 'Property Type',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'projectNumber',
    displayName: 'Project Number',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'businessUnit',
    displayName: 'Business Unit',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'lastInventoryDate',
    displayName: 'Last Inventory Date',
    fieldType: FieldType.DateTime,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'account',
    displayName: 'Account',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'insuranceAccount',
    displayName: 'Insurance Account',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'accountClass',
    displayName: 'Account Class',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'division',
    displayName: 'Division',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'gLAccount',
    displayName: 'GL Account',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'costReplacementNew',
    displayName: 'Cost Replacement New',
    fieldType: FieldType.Double,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'netProceeds',
    displayName: 'Net Proceeds',
    fieldType: FieldType.Double,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'salvageValue',
    displayName: 'Salvage Value',
    fieldType: FieldType.Double,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'fundContribution',
    displayName: 'Fund Contribution',
    fieldType: FieldType.Double,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'disposalCode',
    displayName: 'Disposal Code',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'disposalDate',
    displayName: 'Disposal Date',
    fieldType: FieldType.DateTime,

    isSearchable: false,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'sourceCode',
    displayName: 'Source Code',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'assetFileId',
    displayName: 'Asset File Id',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'sourceRecordId',
    displayName: 'Source Record Id',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl1',
    displayName: 'Inventory Image Url 1',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl2',
    displayName: 'Inventory Image Url 2',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl3',
    displayName: 'Inventory Image Url 3',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl4',
    displayName: 'Inventory Image Url 4',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl5',
    displayName: 'Inventory Image Url 5',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl6',
    displayName: 'Inventory Image Url 6',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  },
  {
    name: 'inventoryImageUrl7',
    displayName: 'Inventory Image Url 7',
    fieldType: FieldType.String,

    isSearchable: true,
    isFilterable: true,
    isSortable: true,
    isFacetable: false,
    isKey: false,
    isCustom: false,
    isEditable: false
  }
];
