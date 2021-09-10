import { FormField } from '../../../../../_models/form-field.model';
import { FieldType } from '../../../../../_enums/field-type';

export const InitialFloodPlainFieldLayout = {
  left: ['floodPlainFloodZoneIdentifier',
  'baseFloodElevation'],
  right: ['floodZoneCertificateNo',
  'floodZoneLoadDate']
};

export const InitialFloodPlainFields = [
  <FormField>{
    id: 'floodPlainFloodZoneIdentifier',
    required: false,
    displayName: 'Flood Zone Identifier',
    value: '',
    type: FieldType.String,
  },
 

  <FormField>{
    id: 'baseFloodElevation',
    required: false,

    displayName: 'Base Flood Elevation',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodZoneCertificateNo',
    required: false,

    displayName: 'Flood Zone Certificate No',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodZoneLoadDate',
    required: false,

    displayName: 'Flood Zone Load Date',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  }
];

export const BuildingFloodPlainFieldLayout = {
  left: [   'floodPlainStatusCode',
  'floodPlainDescription',
  'floodPlainNFIPCommunityFirmDate',
  'floodPlainNFIPCommunityName',
  'floodPlainNFIPCommunityParticipationStartDate',
  'floodPlainNFIPCounty',
  'floodPlainNFIPState',
  'floodPlainFloodDepth',
  'floodPlainFloodZoneboundary1Identifier',
  'floodPlainFloodZoneboundary1Distance',
  'floodPlainFloodZoneboundary2Identifier'],
  right: ['floodPlainFloodZoneboundary2Distance',
  'floodZone',
  'floodPlainMapIdentifier',
  'floodPlainMapIndicator',
  'floodPlainMapPanelDate',
  'floodPlainMapPanelIdentifier',
  'floodPlainMapPanelSuffixIdentifier',
  'floodPlainSpecialFloodHazardAreaDistanceFeetCount',
  'floodPlainPartialIndicator',
  'floodPlainSpecialFloodHazardAreaIndicator']
};

export const BuildingFloodPlainModel = [
  <FormField>{
    id: 'floodPlainStatusCode',
    required: false,

    displayName: 'Flood Plain Status Code',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainDescription',
    required: false,

    displayName: 'Flood Plain Description',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainNFIPCommunityFirmDate',
    required: false,

    displayName: 'Flood Plain NFIP Community Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.DateTime,
    name: ''
  },

  <FormField>{
    id: 'floodPlainNFIPCommunityName',
    required: false,

    displayName: 'Flood Plain NFIP Community Name',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainNFIPCommunityParticipationStartDate',
    required: false,

    displayName: 'Flood Plain NFIP Community Participation Start Date',
    value: '',
    isReadOnly: true,
    type: FieldType.DateTime,
    name: ''
  },

  <FormField>{
    id: 'floodPlainNFIPCounty',
    required: false,

    displayName: 'Flood Plain NFIP County',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainNFIPState',
    required: false,

    displayName: 'Flood Plain NFIP State',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainFloodDepth',
    required: false,

    displayName: 'Flood Plain Flood Depth',
    value: '',
    isReadOnly: true,
    type: FieldType.Double,
    name: ''
  },

  <FormField>{
    id: 'floodPlainFloodZoneboundary1Identifier',
    required: false,

    displayName: 'Flood Plain Flood Zone Boundary 1 Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainFloodZoneboundary1Distance',
    required: false,

    displayName: 'Flood Plain Flood Zone Boundary 1 Distance',
    value: '',
    isReadOnly: true,
    type: FieldType.Double,
    name: ''
  },

  <FormField>{
    id: 'floodPlainFloodZoneboundary2Identifier',
    required: false,

    displayName: 'Flood Plain Flood Zone Boundary 2 Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainFloodZoneboundary2Distance',
    required: false,

    displayName: 'Flood Plain Flood Zone Boundary 2 Distance',
    value: '',
    isReadOnly: true,
    type: FieldType.Double,
    name: ''
  },

  <FormField>{
    id: 'floodZone',
    required: false,

    displayName: 'Flood Zone',
    value: '',
    type: FieldType.String,
    isReadOnly: true,
    name: ''
  },

  <FormField>{
    id: 'floodPlainMapIdentifier',
    required: false,

    displayName: 'Flood Plain Map Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainMapIndicator',
    required: false,

    displayName: 'Flood Plain Map Indicator',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainMapPanelDate',
    required: false,

    displayName: 'Flood Plain Map Panel Date',
    value: '',
    isReadOnly: true,
    type: FieldType.DateTime,
    name: ''
  },

  <FormField>{
    id: 'floodPlainMapPanelIdentifier',
    required: false,

    displayName: 'Flood Plain Map Panel Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainMapPanelSuffixIdentifier',
    required: false,

    displayName: 'Flood Plain Map Panel Suffix Identifier',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainSpecialFloodHazardAreaDistanceFeetCount',
    required: false,

    displayName: 'Flood Plain Special Flood Hazard Area Distance Feet Count',
    value: '',
    isReadOnly: true,
    type: FieldType.Double,
    name: ''
  },

  <FormField>{
    id: 'floodPlainPartialIndicator',
    required: false,

    displayName: 'Flood Plain Partial Indicator',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  },

  <FormField>{
    id: 'floodPlainSpecialFloodHazardAreaIndicator',
    required: false,

    displayName: 'Flood Plain Special Flood Hazard Area Indicator',
    value: '',
    isReadOnly: true,
    type: FieldType.String,
    name: ''
  }
];
