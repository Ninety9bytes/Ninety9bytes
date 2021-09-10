import { ImageDto } from './image.dto';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';

export interface BuildingDto {
  acquiredDate?: Date | undefined;
  activityCode: string | undefined;
  addressLine1?: string;
  addressLine2?: string;
  architectPercent: string | undefined;
  autoFireAlarm?: string | undefined;
  avgStoryHeight: string | undefined;
  baseFloodElevation: string | undefined;
  basementConstructionClass?: string | undefined;
  basementDepth: string | undefined;
  basementFinishedArea: string | undefined;
  basementFloorArea: string | undefined;
  basementOccupancyCode: string | undefined;
  basementUnfinishedArea: string | undefined;
  buildingAttributes?: Array<BuildingAttributeDto> | undefined;
  buildingCondition: string | undefined;
  buildingImages: ImageDto[];
  buildingName: string | undefined;
  buildingNumber: string | undefined;
  buildingOccupancy?: string | undefined;
  buildingOverride: string | undefined;
  buildingSelectedAdditions?: Array<BuildingSelectedAddition> | undefined;
  buildingSelectedAdjustments?: Array<BuildingSelectedAdjustment> | undefined;
  city?: string;
  clientUniqueIdentifier: string | undefined;
  climate: string | undefined;
  contentCode: string | undefined;
  contentCostReproductionNew: string | undefined;
  contentOverride: string | undefined;
  contentQuality: string | undefined;
  costReplacementNew: number | undefined;
  costReproductionNewLessDepreciation: string | undefined;
  costReproductionNewWithUserFactors?: string;
  costReproductionNew: string | undefined;
  country?: string;
  crawlspaceArea: string | undefined;
  customAdditions?: CustomAddtionDto[];
  customColumns?: Array<FieldMetaDataDto>;
  dateEntered: Date | undefined;
  degreeSlope: string | undefined;
  depreciationPercent: string | undefined;
  description?: string | undefined;
  distanceToCoast: string | undefined;
  distanceToFireHydrant: string | undefined;
  distanceToFireStation: string | undefined;
  effectiveAge: string | undefined;
  employee: string | undefined;
  entryAlarm?: string | undefined;
  exclusionsPercent: string | undefined;
  exteriorWallOpeningsPercent: string | undefined;
  fireDepartment?: string | undefined;
  floodPlainDescription?: string;
  floodPlainFloodDepth?: number;
  floodPlainFloodZoneIdentifier?: string;
  floodPlainFloodZoneboundary1Distance?: number;
  floodPlainFloodZoneboundary1Identifier?: string;
  floodPlainFloodZoneboundary2Distance?: number;
  floodPlainFloodZoneboundary2Identifier?: string;
  floodPlainMapIdentifier?: string;
  floodPlainMapIndicator?: string;
  floodPlainMapPanelDate?: string;
  floodPlainMapPanelIdentifier?: string;
  floodPlainMapPanelSuffixIdentifier?: string;
  floodPlainNFIPCommunityFirmDate?: string;
  floodPlainNFIPCommunityIdentifier?: string;
  floodPlainNFIPCommunityName?: string;
  floodPlainNFIPCommunityParticipationStartDate?: string;
  floodPlainNFIPCounty?: string;
  floodPlainNFIPState?: string;
  floodPlainPartialIndicator?: string;
  floodPlainSpecialFloodHazardAreaDistanceFeetCount?: number;
  floodPlainSpecialFloodHazardAreaIndicator?: string;
  floodPlainStatus?: string;
  floodPlainStatusCode?: string;
  floodPlainStatusName?: string;
  floodZone: string | undefined;
  floodZoneCertificateNo: string | undefined;
  floodZoneLoadDate?: Date | undefined;
  floodZoneIdentifier: string | undefined;
  floor?: string | undefined;
  floorArea: string | undefined;
  freightElevator?: string | undefined;
  historicRegisterNational?: string | undefined;
  historicRegisterOther?: string | undefined;
  historicRegisterState?: string | undefined;
  iRISRowID: string | undefined;
  id: string | undefined;
  imageCollection?: ImageDto[];
  inspectionDate: Date | undefined;
  latitude: string | undefined;
  leasedBuilding: boolean;
  legacyPhotoLocation: string | undefined;
  longitude: string | undefined;
  manualFireAlarm?: string | undefined;
  memberName?: string;
  memberNumber?: number;
  numberOfStories?: number;
  occupancyCodes?: Array<OccupancyCodeDto> | undefined;
  overheadPercent: string | undefined;
  passengerElevator?: string | undefined;
  perimeter: string | undefined;
  plumbingFixtures: string | undefined;
  previousDPBuildingCostReplacementNew: string | undefined;
  previousDPContentCostReproductionNew: string | undefined;
  previousDPSF: number;
  protectionClass?: string | undefined;
  quality: string | undefined;
  removeSlabArea: string | undefined;
  scopeOfService: string | undefined;
  secondaryATCOccupancyCode?: string | undefined;
  secondaryAtticInsulation?: string | undefined;
  secondaryBasement?: string | undefined;
  secondaryCladdingType?: string | undefined;
  secondaryCommercialAppurtenantStructures?: string | undefined;
  secondaryConstructionQuality?: string | undefined;
  secondaryContentGrade?: string | undefined;
  secondaryEQAppendagesAndOrnamentation?: string | undefined;
  secondaryEQAsymmetryAndTorsion?: string | undefined;
  secondaryEQBaseIsolation?: string | undefined;
  secondaryEQBuildingExterior50PercentRule?: string | undefined;
  secondaryEQCrippleWalls?: string | undefined;
  secondaryEQEngineeredFoundations?: string | undefined;
  secondaryEQEquipmentEQBracing?: string | undefined;
  secondaryEQEquipmentSupportMaintenance?: string | undefined;
  secondaryEQExteriorWallsOrCladding?: string | undefined;
  secondaryEQFrameBoltedToFoundation?: string | undefined;
  secondaryEQGaraging?: string | undefined;
  secondaryEQInteriorWallsOrPartitions?: string | undefined;
  secondaryEQPlanIrregularity?: string | undefined;
  secondaryEQPoundingAndImpact?: string | undefined;
  secondaryEQQualityOfConstruction?: string | undefined;
  secondaryEQRedundancy?: string | undefined;
  secondaryEQShortColumnCondition?: string | undefined;
  secondaryEQSoftStory?: string | undefined;
  secondaryEQStructuralUpgradeNonURM?: string | undefined;
  secondaryEQTank?: string | undefined;
  secondaryEQTiltUpRetrofitAnchoring?: string | undefined;
  secondaryEQURMRetrofit?: string | undefined;
  secondaryEQVerticalIrregularity?: string | undefined;
  secondaryFireAlarm?: string | undefined;
  secondaryFlashingAndCopingQuality?: string | undefined;
  secondaryFloodProtection?: string | undefined;
  secondaryFrameFoundationConnection?: string | undefined;
  secondaryGroundLevelEquipment?: string | undefined;
  secondaryIceDamProtection?: string | undefined;
  secondaryMechanicalElectricalEquipment?: string | undefined;
  secondaryOpeningProtection?: string | undefined;
  secondaryPlumbingInsulation?: string | undefined;
  secondaryRMSConstructionCode?: string | undefined;
  secondaryResidentialAppurtenantStructures?: string | undefined;
  secondaryResistanceDoors?: string | undefined;
  secondaryRoofAgeCondition?: string | undefined;
  secondaryRoofAnchor?: string | undefined;
  secondaryRoofCovering?: string | undefined;
  secondaryRoofEquipmentBracing?: string | undefined;
  secondaryRoofFramingType?: string | undefined;
  secondaryRoofGeometry?: string | undefined;
  secondaryRoofMaintenance?: string | undefined;
  secondaryRoofParapetsChimneys?: string | undefined;
  secondaryRoofSheathingAttachment?: string | undefined;
  secondaryRoofVentilation?: string | undefined;
  secondarySnowGuards?: string | undefined;
  secondarySprinklerType?: string | undefined;
  secondaryTreeDensity?: string | undefined;
  secondaryWindMissiles?: string | undefined;
  seismic: string | undefined;
  siteAccessibility: string | undefined;
  siteId: string | undefined;
  siteName?: string;
  siteNumber?: number;
  sitePosition: string | undefined;
  soilCondition: string | undefined;
  sprinkler?: string | undefined;
  state?: string;
  stiltsConcreteArea: string | undefined;
  stiltsWoodArea: string | undefined;
  story: string | undefined;
  type: string | undefined;
  unitOfMeasure: string | undefined;
  updatedUserId?: string;
  userFactors?: UserFactorDto[];
  vacantBuilding?: string | undefined;
  valuationExpirationDate?: string | undefined;
  valuationErrorDescription?: string | undefined;
  valuationEffectiveDate?: string | undefined;
  valuationCreatedDate?: string | undefined;
  valuationActualCashValue?: string | undefined;
  valuationLastUpdateMultiplier?: string | undefined;
  valuationId?: string | undefined;
  valuationNumber?: string | undefined;
  wind: string | undefined;
  yearBuilt: number;
  zipCode?: number;
}

export interface UserFactorDto {
  id: string;
  factor: string;
  description: string;
}

export interface CustomAddtionDto {
  id: string;
  cost: string;
  description: string;
}

export interface BuildingResponseDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  buildings: BuildingDto[];
  buildingsSummary?: BuildingsSummaryDto;
}

export interface OccupancyCodeDto {
  id: string;
  buildingAttributeCodeId: string;
  storyHeight: number;
  percent: number;
  attributeType: number;
  description?: string;
}

export interface BuildingAttributeDto {
  buildingAttributeCodeId: string;
  value: number;
  id?: string;
  attributeType?: number;
  isAdded?: boolean;
}

export interface ValuationResponseDto {
  buildingId: string;
  buildingName: string;
  success: boolean;
  errorsAssociated: number;
}

export interface BuildingSelectedAddition {
  id: string;
  buildingId: string;
  referenceBuildingAdditionCriterionId: string;
  childAdditionCriterionId: string;
  buildingSelectedAdjustments: Array<BuildingSelectedAdjustment>;
  criterionValue: any;
  quantity: number;
  totalCost: string;
}

export interface BuildingSelectedAdjustment {
  id: string;
  referenceBuildingAdditionAdjustmentId: string;
  value?: any;
}

export interface CreateBuildingAttributeDto {
  buildingAttributeCodeId: string;
  value: number;
}

export interface BuildingsSummaryDto {
  totalCount: number;
  TotalBuildingValue: number;
  TotalContentValue: number;
  TotalLiValue: number;
  TotalInsurableValues: number;
  TotalSquareFeet: number;
}
