import {map} from 'rxjs/operators';
import { TranslatedComponent } from '../i18n/translated-component';
import { TranslationBaseKeys } from '../i18n/translation-base-keys';
import { TranslationManager } from '../i18n/translation-manager';
import { HelperService } from './helper.service';
import { Injectable } from '@angular/core';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AttributeTypesAndCodesResult, AttributeTypeOption } from '../../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';
import { BuildingDto } from '../../_api/_runtime/dtos/building.dto';
import { BuildingHierarchyDto, HierarchyMemberDto, HierarchyBuildingDto } from '../../_api/_runtime/dtos/building-hierarchy.dto';
import { SiteDto } from '../../_api/_runtime/dtos/site.dto';
import { AttributeCode, AttributeCodeResult } from '../../_api/_configuration/dtos/attribute-code-result.dto';
import { FieldOption } from '../../_models/field-option.model';
import { ContentCode } from '../../_api/_configuration/dtos/content-code.dto';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';
import { RecordType } from '../../_api/_runtime/enums/record-type';
import { ActivityCode } from '../../_api/_runtime/enums/activity-code';
import { EntryAlarm } from '../../_api/_runtime/enums/entry-alarm';
import { UnitOfMeasure } from '../../_api/_runtime/enums/unit-of-measure';
import { BuildingCondition } from '../../_api/_runtime/enums/building-condition';

@Injectable()
export class BuildingInfoService implements TranslatedComponent {
  i18n = TranslationBaseKeys;
  constructor(
    private insuranceApiService: InsuranceApiService,
    private referenceDataApiService: ReferenceDataApiService,
    private translateService: TranslationManager,
    private helperService: HelperService
  ) {}

  public buildingAttributeCodesSource = new BehaviorSubject<AttributeTypesAndCodesResult>(undefined);
  public buildingAttributeCodes$ = this.buildingAttributeCodesSource.asObservable();

  public cascadedSelectedOption = new BehaviorSubject<Array<CascadedSelectOption>>(new Array<CascadedSelectOption>());
  public cascadedTree$ = this.cascadedSelectedOption.asObservable();

  private hiddenColumns = [
    'id',
    'siteId',
    'iRISRowID',
    'buildingId',
    'childAdditionCriterionId',
    'referenceBuildingAdditionCriterionId',
    'updatedUserId'
  ];

  private occupancyCodeAttributeTypeCode = '101';

  /* Columns To display as default (from Jason S):
1.	Activity Code
2.	Building Type
3.	Date Of Inspection
4.	Member
5.	Building description
6.	Unit of Measure
7.	Site
8.	Building Name
*/
  private defaultColumns = [
    'activityCode',
    'memberNumber',
    'siteNumber',
    'buildingNumber',
    'buildingName',
    'costReproductionNew',
    'valuationCreatedDate',
    'floorArea',
    'basementFloorArea',
    'inspectionDate',
    'valuationNumber',
    'displayId'
  ];

  private readonlyColumns = [
    'displayId',
    'id',
    'valuationId',
    'valuationNumber',
    'valuationLastUpdateMultiplier',
    'valuationEffectiveDate',
    'valuationExpirationDate',
    'valuationCreatedDate',
    'valuationActualCashValue',
    'valuationErrorCode',
    'valuationErrorDescription',
    'iRISRowID',
    'siteId',
    'memberName',
    'memberNumber',
    'siteNumber',
    'siteName',
    'updatedUserId',
    'basementFloorArea',
    'floodPlainStatus',
    'floodPlainStatusName',
    'floodPlainStatusCode',
    'floodPlainDescription',
    'floodPlainNFIPCommunityFirmDate',
    'floodPlainNFIPCommunityIdentifier',
    'floodPlainNFIPCommunityName',
    'floodPlainNFIPCommunityParticipationStartDate',
    'floodPlainNFIPCounty',
    'floodPlainNFIPState',
    'floodPlainFloodDepth',
    'floodPlainFloodZoneboundary1Identifier',
    'floodPlainFloodZoneboundary1Distance',
    'floodPlainFloodZoneboundary2Identifier',
    'floodPlainFloodZoneboundary2Distance',
    'floodPlainFloodZoneIdentifier',
    'floodPlainMapIdentifier',
    'floodPlainMapIndicator',
    'floodPlainMapPanelDate',
    'floodPlainMapPanelIdentifier',
    'floodPlainMapPanelSuffixIdentifier',
    'floodPlainSpecialFloodHazardAreaDistanceFeetCount',
    'floodPlainPartialIndicator',
    'floodPlainSpecialFloodHazardAreaIndicator'
  ];

  private siteAttributeColumns = [
    'soilCondition',
    'degreeSlope',
    'siteAccessibility',
    'sitePosition'
  ];

  public GetReadonlyAndHiddenFields(): Array<string> {
    return this.readonlyColumns.concat(this.hiddenColumns);
  }

  public GetInternalColumns(): Array<string> {
    return this.hiddenColumns;
  }

  public GetDefaultColumns(): Array<string> {
    return this.defaultColumns;
  }

  public GetSiteAttributeFields(): Array<string>  {
    return this.siteAttributeColumns;
  }

  public mapGridColumns(buildings: BuildingDto[]): BuildingDto[] {
    buildings.forEach(building => {
      building.imageCollection = building.buildingImages;
      building.activityCode = this.mapActivityCode(parseInt(building.activityCode, 10));
      building.type = this.mapRecordType(parseInt(building.type, 10));
      building.entryAlarm = this.mapEntryAlarmType(parseInt(building.entryAlarm, 10));
      building.unitOfMeasure = this.mapUnitOfMeasure(parseInt(building.unitOfMeasure, 10));
      building.buildingCondition = this.mapBuildingCondition(parseInt(building.buildingCondition, 10));
      building.sitePosition=this.mapSitePositionValue(building.sitePosition);
      building.siteAccessibility=this.mapSiteAccessibilityValue(building.siteAccessibility);
      building.soilCondition=this.mapSoilConditionValue(building.soilCondition);
      building.degreeSlope=this.mapDegreeSlopeValue(building.degreeSlope);
    });

    return buildings;
  }

  public convertStringsToEnum(building: BuildingDto): BuildingDto {
    building.activityCode = this.parseActivityCode(building.activityCode).toString();
    building.type = this.parseRecordType(building.type);
    building.entryAlarm = this.parseEntryAlarmType(building.entryAlarm);
    building.unitOfMeasure = this.parseUnitOfMeasure(building.unitOfMeasure);
    building.buildingCondition = this.parseBuildingCondition(building.buildingCondition);
    return building;
  }

  public updateBuildingAttributeCodes(attributeTypesAndCodesResult: AttributeTypesAndCodesResult) {
    this.buildingAttributeCodesSource.next(attributeTypesAndCodesResult);
  }

  public getBuildingHierarchyByGroupId(groupId: string): Observable<BuildingHierarchyDto> {
    return this.insuranceApiService.getBuildingHierarchyByGroupId(groupId);
  }

  public getSitesByGroupId(groupId: string): Observable<Array<SiteDto>> {
    return this.insuranceApiService.getSitesByGroup(groupId);
  }

  public mapAttributeCodeToSelectOptions(dto: Array<AttributeCode>): Array<CascadedSelectOption> {
    const options = new Array<CascadedSelectOption>();

    if (dto) {
      dto.forEach(option => {
        options.push(<CascadedSelectOption>{
          key: option.buildingAttributeCodeId,
          displayName: option.description,
          options: new Array<CascadedSelectOption>()
        });
      });
    }

    return options;
  }

  public mapAttributeCodeToFieldOptions(dto: Array<AttributeTypeOption>): Array<FieldOption> {
    const options = new Array<FieldOption>();

    if (dto) {
      dto.forEach(option => {
        options.push(<FieldOption>{
          key: option.buildingAttributeCodeId,
          displayName: option.description
        });
      });
    }

    return options;
  }

  public mapContentCodeToFieldOptions(dto: Array<ContentCode>): Array<FieldOption> {
    const options = new Array<FieldOption>();

    if (dto) {
      dto.forEach(option => {
        options.push(<FieldOption>{
          key: option.description,
          displayName: option.description
        });
      });
    }

    return options;
  }

  public mapEnumDtoToSelectOptions(dto: EnumDto): Array<CascadedSelectOption> {
    const options = new Array<CascadedSelectOption>();

    if (dto && dto.enumOptions) {
      dto.enumOptions.forEach(option => {
        options.push(<CascadedSelectOption>{
          key: option.value.toString(),
          displayName: this.translateService.instant(this.i18n.building + option.displayName),
          options: new Array<CascadedSelectOption>()
        });
      });
    }

    return options;
  }

  public mapSitesToSelectOptions(dto: BuildingHierarchyDto): Array<CascadedSelectOption> {
    const options = new Array<CascadedSelectOption>();

    if (dto.buildings.length > 0) {
      options.push(<CascadedSelectOption>{
        key: 'blankMember',
        displayName: '-',
        options: [<CascadedSelectOption>{ key: 'blankSite', displayName: '-', options: this.mapBuildings(dto.buildings) }]
      });
    }

    dto.members.forEach(member => {
      if (options.findIndex(c => c.key === member.id) === -1) {
        options.push(<CascadedSelectOption>{
          key: member.id,
          displayName: member.name,
          options: this.mapSites(member)
        });
      }
    });
    return this.helperService.sortCollection(options, 'displayName');
  }

  public mapBuildingSelection(selectedKey: string, options: Array<CascadedSelectOption>): string {
    let selectedValue = '';

    if (options) {
      options.forEach(member => {
        member.options.forEach(site => {
          if (site.options.findIndex(building => building.key === selectedKey) >= 0) {
            selectedValue = `${member.key},${site.key},${selectedKey}`;
          }
        });
      });
    }

    return selectedValue ? selectedValue : `blankMember,blankSite`;
  }

  public mapMemberSiteSelection(selectedKey: string, options: Array<CascadedSelectOption>): string {
    let selectedValue = '';

    options.forEach(member => {
      member.options.forEach(site => {
        if (site.key === selectedKey) {
          selectedValue = `${member.key},${selectedKey}`;
        }
      });
    });

    return selectedValue;
  }

  public getAttributes(): Observable<EnumDto> {
    return this.referenceDataApiService.getAttributeType().pipe(map(c => c.result));
  }

  public getAttributeCodes(attributeTypeId: number): Observable<AttributeCodeResult> {
    return this.referenceDataApiService.getAttributeCodes(attributeTypeId);
  }

  public getAttributeTypesAndCodes(): Observable<Array<AttributeTypesAndCodesResult>> {
    return this.referenceDataApiService.getAttributeTypesAndCodes().pipe(map(c => c.result));
  }

  public getContentCodes(): Observable<Array<ContentCode>> {
    return this.referenceDataApiService.getContentCodes().pipe(map(c => c.result));
  }

  public getBuildingConditions(): Observable<EnumDto> {
    return this.referenceDataApiService.getBuildingConditions().pipe(map(c => c.result));
  }
  public getBuildingPerimeterAdjustmentMethod(): Observable<EnumDto> {
    return this.referenceDataApiService.getBuildingPerimeterAdjustmentMethod().pipe(map(c => c.result));
  }
  public getEntryAlarmOptions(): Observable<EnumDto> {
    return this.referenceDataApiService.getEntryAlarmOptions().pipe(map(c => c.result));
  }

  public getUnitsOfMEasure(): Observable<EnumDto> {
    return this.referenceDataApiService.getUnitsOfMeasure().pipe(map(c => c.result));
  }

  private mapSites(member: HierarchyMemberDto): Array<CascadedSelectOption> {
    const sites = new Array<CascadedSelectOption>();

    member.sites.forEach(site => {
      if (sites.findIndex(c => c.key === site.id) === -1) {
        sites.push(<CascadedSelectOption>{
          key: site.id,
          displayName: site.name,
          options: this.mapBuildings(site.buildings)
        });
      }
    });

    return this.helperService.sortCollection(sites, 'displayName');
  }

  private mapBuildings(buildings: Array<HierarchyBuildingDto>): Array<CascadedSelectOption> {
    const options = new Array<CascadedSelectOption>();

    buildings.forEach(building => {
      options.push(<CascadedSelectOption>{
        key: building.id,
        displayName: building.name
      });
    });

    return this.helperService.sortCollection(options, 'displayName');
  }

  private mapRecordType(recordType: RecordType): string {
    switch (recordType) {
      case RecordType.Building:
        return 'Building';
      case RecordType.LandImprovement:
        return 'Land Improvement';
      case RecordType.MinorBuilding:
        return 'Minor Building';
      default:
        return 'Unknown Record Type';
    }
  }

  private parseRecordType(recordType: string): string | undefined {
    if (recordType) {
      if (recordType === 'Building') { return RecordType.Building.toString(); }
      if (recordType === 'Land Improvement') { return RecordType.LandImprovement.toString(); }
      if (recordType === 'Minor Building') { return RecordType.MinorBuilding.toString(); }
    }
    return undefined;
  }

  private mapActivityCode(activityCode: ActivityCode): string {
    switch (activityCode) {
      case ActivityCode.Active:
        return 'Active';
      case ActivityCode.Deactivated:
        return 'Deactivated';
      case ActivityCode.New:
        return 'New';
      case ActivityCode.Retired:
        return 'Retired';
      default:
        return 'Unknown Activity Code';
    }
  }

  private mapBuildingCondition(buildingCondition: BuildingCondition): string {
    switch (buildingCondition) {
      case BuildingCondition.Excellent:
        return 'Excellent';
      case BuildingCondition.Good:
        return 'Good';
      case BuildingCondition.Average:
        return 'Average';
      case BuildingCondition.Fair:
        return 'Fair';
      case BuildingCondition.Poor:
        return 'Poor';
      case BuildingCondition.Dilapidated:
        return 'Dilapidated';
      case BuildingCondition.NA:
        return 'NA';        
      default:
        return '';
    }
  }

  private parseActivityCode(activityCode: string): string | undefined {
    if (!activityCode) { return undefined; }
    if (activityCode === 'Active') { return ActivityCode.Active.toString(); }
    if (activityCode === 'Deactivated') { return ActivityCode.Deactivated.toString(); }
    if (activityCode === 'New') { return ActivityCode.New.toString(); }
    if (activityCode === 'Retired') { return ActivityCode.Retired.toString(); }
    return undefined;
  }

  private parseBuildingCondition(buildingCondition: string): string | undefined {
    if (!buildingCondition) { return undefined; }
    if (buildingCondition === 'Excellent') { return BuildingCondition.Excellent.toString(); }
    if (buildingCondition === 'Good') { return BuildingCondition.Good.toString(); }
    if (buildingCondition === 'Average') { return BuildingCondition.Average.toString(); }
    if (buildingCondition === 'Fair') { return BuildingCondition.Fair.toString(); }
    if (buildingCondition === 'Poor') { return BuildingCondition.Poor.toString(); }
    if (buildingCondition === 'Dilapidated') { return BuildingCondition.Dilapidated.toString(); }
    if (buildingCondition === 'NA') { return BuildingCondition.NA.toString(); }
    return undefined;
  }

  private mapEntryAlarmType(entryAlarm: EntryAlarm): string {
    switch (entryAlarm) {
      case EntryAlarm.No:
        return 'No';
      case EntryAlarm.Yes:
        return 'Yes';
      case EntryAlarm.Partial:
        return 'Partial';
    }
  }

  private parseEntryAlarmType(entryAlarm: string): string | undefined {
    if (!entryAlarm) { return undefined; }
    if (entryAlarm === 'No') { return EntryAlarm.No.toString(); }
    if (entryAlarm === 'Yes') {return EntryAlarm.Yes.toString(); }
    if (entryAlarm === 'Partial') {return EntryAlarm.Partial.toString(); }
    return undefined;
  }

  private mapUnitOfMeasure(unitOfMeasure: UnitOfMeasure): string {
    switch (unitOfMeasure) {
      case UnitOfMeasure.Feet:
        return 'Feet';
      case UnitOfMeasure.Meters:
        return 'Meters';
    }
  }

  private parseUnitOfMeasure(unitOfMeasure: string): string | undefined {
    if (!unitOfMeasure) { return undefined; }
    if (unitOfMeasure === 'Feet') { return UnitOfMeasure.Feet.toString(); }
    if (unitOfMeasure === 'Meters') { return UnitOfMeasure.Meters.toString(); }
    return undefined;
  }
  
  mapSitePosition = new Map<string, string>();
  private mapSitePositionValue(sitePosition: string): string | undefined {
    this.mapSitePosition.set("db24628b-f40d-400c-bb8d-aff6f9c60bfa", "Unknown");
    this.mapSitePosition.set("266ab478-01c8-4c46-8c93-02ddfb57198b", "Downhill");
    this.mapSitePosition.set("53fe322f-485c-46f7-ad9d-8db0b0ab32f4", "Uphill");
    return this.mapSitePosition.get(sitePosition);
  }
  mapSiteAccessibility = new Map<string, string>();
  private mapSiteAccessibilityValue(siteAccessibility: string): string | undefined {
    this.mapSiteAccessibility.set("630c3d59-7ddc-42b2-8af6-0582688eaf0b", "Excellent");
    this.mapSiteAccessibility.set("0b71e4ef-639c-4d75-91f4-5dd677e11468", "Good");
    this.mapSiteAccessibility.set("8817bcc8-2099-4173-a5be-f85ff77ca774", "Fair");
    this.mapSiteAccessibility.set("a1d639de-85d1-400d-9b83-3bc3449fa5db", "Poor");
    return this.mapSiteAccessibility.get(siteAccessibility);;
  }
  mapSoilCondition = new Map<string, string>();
  private mapSoilConditionValue(soilCondition: string): string | undefined {
    this.mapSoilCondition.set("42bd3ad8-52ba-48d2-b730-f904dedee28a", "Excellent");
    this.mapSoilCondition.set("8f8454ab-0392-4707-b662-2c5aab4ddb74", "Good");
    this.mapSoilCondition.set("b0c1e52c-7b26-44ea-a0f2-f08631f76b39", "Fair");
    this.mapSoilCondition.set("65ac8f8c-498d-47d1-8511-a649e0f2fd7a", "Poor");
    return this.mapSoilCondition.get(soilCondition);;
  }
  mapDegreeSlope = new Map<string, string>();
  private mapDegreeSlopeValue(degreeSlope: string): string | undefined {
    this.mapDegreeSlope.set("c1d4b048-3d48-40d4-9b8f-35b2c7f01534", "Level");
    this.mapDegreeSlope.set("4d1d699e-7c3d-4274-bb1f-9b2dcca2db59", "15%");
    this.mapDegreeSlope.set("fadc42f9-293b-401c-a3df-2081cf86b859", "30%");
    this.mapDegreeSlope.set("76eea7c1-3122-430d-b742-6e69064f50e1", "45%");
    return this.mapSitePosition.get(degreeSlope);
  }
}
