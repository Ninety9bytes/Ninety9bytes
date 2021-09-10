import { FormField } from '../../../../../../_models/form-field.model';
import { CascadedSelectValue } from '../../../../../../_models/cascaded-select-value.model';
import { CascadedSelectOption } from '../../../../../../_models/cascaded-select-option.model';
import { FieldType } from '../../../../../../_enums/field-type';
import { FieldOption } from '../../../../../../_models/field-option.model';

export enum FormModelEnum {
  PrimaryInfoFields,
  BuildingFloodPlainModelFields,
  CopeDataModelFields,
  BuildingLocationFields,
  BuildingValuationFields,
  BuildingSuperstructureFields,
  BuildingSubstructureFields,
  BuildingOccupancyFields,
  BuildingConstructionFields,
  BuildingSystemsFields,
  BuildingSiteAttributeFields,
  AdditionalDataFields,
  CoreLogicFields,
  BuildingAttributeFields,
  BuildingImages,
  CopedataWindFields,
  CopeDataEarthquakeFields,
  InitialFloodPlainFields
}

export const PrimaryInfoFieldLayout = {
  left: ['siteId', 'buildingNumber', 'buildingName', 'clientUniqueIdentifier', 'buildingImages'],
  right: ['type', 'inspectionDate', 'scopeOfService', 'unitOfMeasure', 'activityCode']
};

export const PrimaryInfoFields = [

  <FormField>{
    id: 'siteId',
    required: false,
    displayName: 'Member Name',
    value: '',
    cascadedValues: [
      <CascadedSelectValue>{ name: 'memberId', displayName: 'Member Name' },
      <CascadedSelectValue>{ name: 'siteId', displayName: 'Site Name' }
    ],
    cascadedValueOptions: new Array<CascadedSelectOption>(),
    type: FieldType.CascadingComboBox
  },
  <FormField>{
    id: 'buildingNumber',
    required: true,
    displayName: 'Building Number',
    value: '',
    type: FieldType.String
  },
  <FormField>{
    id: 'buildingName',
    required: true,
    displayName: 'Building Name',
    value: '',
    type: FieldType.String
  },
  <FormField>{
    id: 'clientUniqueIdentifier',
    required: false,
    displayName: 'Client Unique ID',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'type',
    required: false,
    displayName: 'Building Type',
    value: '',
    options: [
      <FieldOption>{ key: '0', displayName: 'Building' },
      <FieldOption>{ key: '1', displayName: 'Minor Building' },
      <FieldOption>{ key: '2', displayName: 'Land Improvement' }
    ],
    type: FieldType.DropDown,
    name: ''
  },


  <FormField>{
    id: 'inspectionDate',
    required: true,
    displayName: 'Date Of Inspection',
    value: '',
    type: FieldType.DateTime
  },
  <FormField>{
    id: 'scopeOfService',
    required: false,
    displayName: 'Scope of Service',
    value: '',
    type: FieldType.String
  },
  <FormField>{
    id: 'unitOfMeasure',
    required: false,
    displayName: 'Unit of Measure',
    value: '',
    options: [<FieldOption>{ key: '', displayName: '' },<FieldOption>{ key: '1', displayName: 'Meters' }, <FieldOption>{ key: '2', displayName: 'Feet' }],
    type: FieldType.DropDown,
    attributeTypeId: 109
  },
  <FormField>{
    id: 'activityCode',
    required: false,
    displayName: 'Activity Code',
    value: '',
    options: [
      <FieldOption>{ key: '0', displayName: 'New' },
      <FieldOption>{ key: '1', displayName: 'Active' },
      <FieldOption>{ key: '2', displayName: 'Deactivated' },
      <FieldOption>{ key: '3', displayName: 'Retired' }
    ],
    type: FieldType.DropDown,
    name: ''
  },

  <FormField>{
    id: 'buildingImages',
    required: false,
    displayName: 'Building Images',
    value: '',
    validation: false,
    type: FieldType.Image
  }
];

export const BuildingLocationFieldLayout = {
  left: ['addressLine1', 'addressLine2', 'latitude', 'longitude'],
  right: ['city', 'state', 'zipCode', 'country']
};

export const BuildingLocationFields = [
  <FormField>{
    id: 'addressLine1',
    required: false,
    displayName: 'Address Line 1',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'addressLine2',
    required: false,
    displayName: 'Address Line 2',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'city',
    required: false,
    displayName: 'City',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'state',
    required: false,
    displayName: 'State',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'zipCode',
    required: false,
    displayName: 'Zip Code',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'country',
    required: false,
    displayName: 'Country',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'latitude',
    required: false,
    displayName: 'Latitude',
    value: '',
    type: FieldType.Double,
    decimalLength: 15,
    format: 'n15'
  },

  <FormField>{
    id: 'longitude',
    required: false,
    displayName: 'Longitude',
    value: '',
    type: FieldType.Double,
    decimalLength: 15,
    format: 'n15'
  },

  <FormField>{
    required: false,
    displayName: '',
    value: '',
    type: FieldType.EmptySpace
  }

];

export const BuildingValuationFieldLayout = {
  left: ['costReproductionNew',
        'buildingOverride',
        'valuationCreatedDate',
        'costReplacementNew',
        'costReproductionNewLessDepreciation',
        'previousDPBuildingCostReplacementNew',
        'previousDPContentCostReproductionNew',
        'previousDPSF'
      ],
  right: ['contentCostReproductionNew',
        'contentOverride',
        'contentCode',
        'contentQuality',
        'depreciationPercent',
        'clientBuildingCRN',
        'clientContentCRN',
        'clientSF']
};

export const BuildingValuationFields = [
  <FormField>{
    id: 'costReproductionNew',
    required: false,
    displayName: 'Cost Reproduction New',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'depreciationPercent',
    required: false,
    displayName: 'Depreciation Percent',
    value: '',
    type: FieldType.Percent
  },



  <FormField>{
    id: 'buildingOverride',
    required: false,
    displayName: 'Building Override',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'valuationCreatedDate',
    required: false,
    displayName: 'Valuation Created Date',
    value: '',
    type: FieldType.DateTime,
    isReadOnly: true,
    format: 'MM/dd/yyyy HH:mm'
  },

  <FormField>{
    id: 'costReplacementNew',
    required: false,
    displayName: 'Cost of Replacement New',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'costReproductionNewLessDepreciation',
    required: false,
    displayName: 'Cost of Reproduction New Less Depreciation',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'previousDPBuildingCostReplacementNew',
    required: false,
    displayName: 'Previous DP Building CRN',
    value: '',
    type: FieldType.Double
  },
  <FormField>{
    id: 'previousDPContentCostReproductionNew',
    required: false,
    displayName: 'Previous DP Content CRN',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'previousDPSF',
    required: false,
    displayName: 'Previous DP SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'contentCostReproductionNew',
    required: false,
    displayName: 'Content Cost Reproduction New',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'contentOverride',
    required: false,
    displayName: 'Content Override',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'contentCode',
    required: false,
    displayName: 'Content Code',
    value: '',
    options: [],
    type: FieldType.DropDown,
    name: ''
  },

  <FormField>{
    id: 'contentQuality',
    required: false,
    displayName: 'Content Quality',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'clientBuildingCRN',
    required: false,
    displayName: 'Client Building CRN',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'clientContentCRN',
    required: false,
    displayName: 'Client Content CRN',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'clientSF',
    required: false,
    displayName: 'Client SF',
    value: '',
    type: FieldType.Integer
  },

];


export const BuildingSuperstructureFieldLayout = {
  left: ['quality',
          'floorArea',
          'buildingPerimeterAdjustmentMethod',
          'perimeter',
          'numberOfStories',
          'avgStoryHeight',
        ],
  right: ['yearBuilt',
          'architectPercent',
          'overheadPercent',
          'effectiveAge',
          'buildingCondition',
          'buildingOccupancy'
        ]
};

export const BuildingSuperstructureFields = [
  <FormField>{
    id: 'floorArea',
    required: false,
    displayName: 'Floor Area',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'perimeter',
    required: false,
    displayName: 'Perimeter',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'yearBuilt',
    required: false,
    displayName: 'Year Built',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'architectPercent',
    required: false,
    displayName: 'Architect Percent',
    value: '',
    type: FieldType.Percent
  },

  <FormField>{
    id: 'buildingCondition',
    required: false,
    displayName: 'Building Condition',
    value: '',
    options: [
      <FieldOption>{ key: '', displayName: '' },
      <FieldOption>{ key: 1, displayName: 'Excellent' },
      <FieldOption>{ key: 2, displayName: 'Good' },
      <FieldOption>{ key: 3, displayName: 'Average' },
      <FieldOption>{ key: 4, displayName: 'Fair' },
      <FieldOption>{ key: 5, displayName: 'Poor' },
      <FieldOption>{ key: 6, displayName: 'Dilapidated' },
      <FieldOption>{ key: 7, displayName: 'N/A' }
    ],
    type: FieldType.DropDown
  },

  <FormField>{
    id: 'quality',
    required: false,
    displayName: 'Quality',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'numberOfStories',
    required: false,
    displayName: 'Number of Stories',
    value: '',
    type: FieldType.Integer,
    min: 0
  },

  <FormField>{
    id: 'avgStoryHeight',
    required: false,
    displayName: 'Average Story Height',
    value: '',
    type: FieldType.Double
  },

  <FormField>{
    id: 'overheadPercent',
    required: false,
    displayName: 'Overhead & Profile Percent',
    value: '',
    type: FieldType.Percent
  },

  <FormField>{
    id: 'effectiveAge',
    required: false,
    displayName: 'Effective Age',
    value: '',
    type: FieldType.Integer
  },
  <FormField>{
    id: 'buildingPerimeterAdjustmentMethod',
    required: true,
    displayName: 'Perimeter Adjustment Method',
    value: '',
    options: [
      <FieldOption>{ key: 0, displayName: 'None' },
      <FieldOption>{ key: 1, displayName: 'Calculated' },
      <FieldOption>{ key: 2, displayName: 'Irregular Shape' },
      <FieldOption>{ key: 3, displayName: 'Very Irregular Shape' },
    ],
    type: FieldType.DropDown
  },

  <FormField>{
    id: 'buildingOccupancy',
    required: false,
    displayName: 'Building Occupancy Override',
    value: '',
    type: FieldType.String
  },
];

export const BuildingSubStructureFieldLayout = {
  left: ['basementFinishedArea', 'basementUnfinishedArea', 'basementFloorArea', 'crawlspaceArea', 'removeSlabArea'],
  right: ['basementConstructionClass', 'basementOccupancyCode', 'basementDepth', 'stiltsWoodArea', 'stiltsConcreteArea']
};

export const BuildingSubStructureFields = [
  <FormField>{
    id: 'basementFinishedArea',
    required: false,
    displayName: 'Basement Finished SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'basementUnfinishedArea',
    required: false,
    displayName: 'Basement Unfinished SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'basementFloorArea',
    required: false,
    displayName: 'Basement Floor Area',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'crawlspaceArea',
    required: false,
    displayName: 'Crawlspace SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'removeSlabArea',
    required: false,
    displayName: 'Remove Slab SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'basementConstructionClass',
    required: false,
    displayName: 'Basement Construction Class',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 110
  },

  <FormField>{
    id: 'basementOccupancyCode',
    required: false,
    displayName: 'Basement Occupancy Code',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 111
  },

  <FormField>{
    id: 'basementDepth',
    required: false,
    displayName: 'Basement Depth',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'stiltsWoodArea',
    required: false,
    displayName: 'Stilts Wood SF',
    value: '',
    type: FieldType.Integer
  },

  <FormField>{
    id: 'stiltsConcreteArea',
    required: false,
    displayName: 'Stilts Concrete SF',
    value: '',
    type: FieldType.Integer
  }
];

export const AdditionalDataFieldLayout = {
  left: [
    'dateEntered',
    'employee',
    'fireDepartment',
    'distanceToFireHydrant',
    'distanceToFireStation',
    'distanceToCoast',
    'legacyPhotoLocation',
    'iRISRowID'
  ],
  right: [
    'exclusionsPercent',
    'leasedBuilding',
    'vacantBuilding',
    'acquiredDate',
    'historicRegisterNational',
    'historicRegisterState',
    'historicRegisterOther',
    'protectionClass',
  ]
};

export const AdditionalDataFields = [

  <FormField>{
    id: 'dateEntered',
    required: false,
    displayName: 'Date Entered',
    value: '',
    type: FieldType.DateTime
  },

  <FormField>{
    id: 'acquiredDate',
    required: false,
    displayName: 'Acquired Date',
    value: '',
    type: FieldType.DateTime
  },

  <FormField>{
    id: 'employee',
    required: false,
    displayName: 'Employee',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'fireDepartment',
    required: false,
    displayName: 'Fire Department',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'distanceToFireHydrant',
    required: false,
    displayName: 'Distance To Fire Hydrant',
    value: '',
    type: FieldType.String,
  },

  <FormField>{
    id: 'distanceToFireStation',
    required: false,
    displayName: 'Distance To Fire Station',
    value: '',
    type: FieldType.String,
  },

  <FormField>{
    id: 'distanceToCoast',
    required: false,
    displayName: 'Distance To Coast',
    value: '',
    type: FieldType.String,
  },

  <FormField>{
    id: 'legacyPhotoLocation',
    required: false,
    displayName: 'Legacy Photo Location',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'iRISRowID',
    required: false,
    displayName: 'IRIS Row ID',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'leasedBuilding',
    required: false,
    displayName: 'Leased Building',
    value: '',
    type: FieldType.Boolean
  },

  <FormField>{
    id: 'vacantBuilding',
    required: false,
    displayName: 'Vacant Building',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'historicRegisterNational',
    required: false,
    displayName: 'Historic Register National',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'historicRegisterState',
    required: false,
    displayName: 'Historic Register State',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'historicRegisterOther',
    required: false,
    displayName: 'Historic Register Other',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'protectionClass',
    required: false,
    displayName: 'Protection Class',
    value: '',
    type: FieldType.String
  },

  <FormField>{
    id: 'valuationEffectiveDate',
    required: false,
    displayName: 'Valuation Eff Date',
    value: '',
    type: FieldType.DateTime,
    isReadOnly: true
  },

  <FormField>{
    id: 'exclusionsPercent',
    required: false,
    displayName: 'Exclusions Percent',
    value: '',
    type: FieldType.Percent
  },

];

export const BuildingSiteAttributeFieldLayout = {
  left: ['degreeSlope',
    'soilCondition',
    'seismic'],
  right: ['siteAccessibility',
    'sitePosition',
    'wind']
};

export const BuildingSiteAttributeFields = [
  <FormField>{
    id: 'degreeSlope',
    required: false,
    displayName: 'Degree Slope',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 112
  },

  <FormField>{
    id: 'soilCondition',
    required: false,
    displayName: 'Soil Condition',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 115
  },

  <FormField>{
    id: 'seismic',
    required: false,
    displayName: 'Seismic',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'siteAccessibility',
    required: false,
    displayName: 'Site Accessibility',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 114
  },

  <FormField>{
    id: 'wind',
    required: false,
    displayName: 'Wind Zone',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'sitePosition',
    required: false,
    displayName: 'Site Position',
    value: '',
    type: FieldType.DropDown,
    attributeTypeId: 113
  }
];

export const CoreLogicFieldLayout = {
  left: [
    'valuationId',
    'valuationNumber',
    ],
  right: [
    'valuationLastUpdateMultiplier',
    'valuationErrorCode',
    'valuationErrorDescription'
 ]
};

export const CoreLogicFields = [
  <FormField>{
    id: 'valuationId',
    required: false,
    displayName: 'Valuation ID',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },




  <FormField>{
    id: 'valuationNumber',
    required: false,
    displayName: 'Valuation Number',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'valuationLastUpdateMultiplier',
    required: false,
    displayName: 'Valuation Last Update Multiplier',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'valuationErrorCode',
    required: false,
    displayName: 'Valuation Error Code',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    id: 'valuationErrorDescription',
    required: false,
    displayName: 'Valuation Error Description',
    value: '',
    type: FieldType.String,
    isReadOnly: true
  },

  <FormField>{
    required: false,
    displayName: '',
    value: '',
    type: FieldType.EmptySpace,
    isReadOnly: true
  }
];


export const BuildingSystemFieldLayout = {
  left: [ 'entryAlarm',
  'manualFireAlarm',
  'autoFireAlarm',
  'sprinkler'],
  right: ['passengerElevator',
  'freightElevator',
  'plumbingFixtures']
};



export const BuildingSystemFields = [
  <FormField>{
    id: 'entryAlarm',
    required: false,
    displayName: 'Entry Alarm',
    value: '',
    options: [
      <FieldOption>{ key: '', displayName: '' },
      <FieldOption>{ key: '1', displayName: 'Yes' },
      <FieldOption>{ key: '2', displayName: 'No' },
      <FieldOption>{ key: '3', displayName: 'Partial' }
    ],
    type: FieldType.DropDown,
    attributeTypeId: 108
  },

  <FormField>{
    id: 'manualFireAlarm',
    required: false,
    displayName: 'Manual Fire Alarm Percent',
    value: '',
    type: FieldType.Double,
    min: 0
  },

  <FormField>{
    id: 'autoFireAlarm',
    required: false,
    displayName: 'Auto Fire Alarm Percent',
    value: '',
    type: FieldType.Double,
    min: 0
  },

  <FormField>{
    id: 'sprinkler',
    required: false,
    displayName: 'Sprinkler Percent',
    value: '',
    type: FieldType.Double,
    min: 0
  },

  <FormField>{
    id: 'passengerElevator',
    required: false,
    displayName: 'Passenger Elevator',
    value: '',
    type: FieldType.Integer,
    min: 0
  },

  <FormField>{
    id: 'freightElevator',
    required: false,
    displayName: 'Freight Elevator',
    value: '',
    type: FieldType.Integer,
    min: 0
  },

  <FormField>{
    id: 'plumbingFixtures',
    required: false,
    displayName: 'Plumbing Fixtures',
    value: '',
    type: FieldType.Integer,
    min: 0
  }
];


export const buildingImages = [

  <FormField>{
    id: 'buildingImages',
    required: false,
    displayName: 'Building Images',
    value: '',
    validation: false,
    type: FieldType.Image
  }

];
