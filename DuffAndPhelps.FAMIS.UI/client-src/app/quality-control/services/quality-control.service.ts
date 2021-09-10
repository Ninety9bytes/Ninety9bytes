
import {map} from 'rxjs/operators';
import * as moment from 'moment-timezone';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { ReplaceFieldSelectionOption, ReplaceFieldSelectionInfo } from '../../_models/shared/replace-field-selection-info.model';
import { AccountDto } from '../../_api/_runtime/dtos/account.dto';
import { DepartmentDto } from '../../_api/_runtime/dtos/department.dto';
import { DataTargetName } from '../../_enums/data-target-name';
import { Asset } from '../../_models/asset.model';
import { FieldOption } from '../../_models/field-option.model';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';
import { BuildingSearchDto } from '../../_api/_runtime/dtos/building-search.dto';
import { BuildingResponseDto } from '../../_api/_runtime/dtos/building.dto';
import { BuildingFilterTermDto } from '../../_api/_runtime/dtos/building-filter-term.dto';
import { BuildingSortTermDto } from '../../_api/_runtime/dtos/building-sort-term.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';
import { AssetFileSummaryDto } from '../../_api/_runtime/dtos/asset-file-summary.dto';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';
import { BuildingHierarchyDto } from '../../_api/_runtime/dtos/building-hierarchy.dto';
import { QualityControlStatusDto } from '../../_api/_runtime/dtos/quality-control-status.dto';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { QualityControlApiService } from '../../_api/_runtime/services/quality-control-api.service';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { AssetFilterTermDto } from '../../_api/_runtime/dtos/asset-filter-term.dto';
import { AssetSearchResponseDto } from '../../_api/_runtime/dtos/asset-search-response.dto';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';
import { Term } from '../../_api/_runtime/dtos/processing-detail-request.dto';
import { AssetSearchDto } from '../../_api/_runtime/dtos/asset-search.dto';
import { ConsolidatedFilePreviewDto } from '../../_api/_runtime/dtos/consolidated-file-preview.dto';
import { AttributeTypesAndCodesResult } from "../../_api/_configuration/dtos/attribute-types-and-codes-result.dto";


@Injectable()
export class QualityControlService {
  private cachedRecordsSource = new BehaviorSubject<Array<Array<Asset>>>(new Array<Array<Asset>>());
  public cachedRecords$ = this.cachedRecordsSource.asObservable();

  public statisExists = true;
  public groupId: string;
  public dataTarget: number;
  public assetFileSummary: AssetFileSummaryDto;

  private groupSiteInfoSource = new BehaviorSubject<Array<CascadedSelectOption>>(new Array<CascadedSelectOption>());
  public groupSiteInfo$ = this.groupSiteInfoSource.asObservable();

  private groupDepartmentInfoSource = new BehaviorSubject<Array<FieldOption>>(new Array<FieldOption>());
  public groupDepartmentInfo$ = this.groupDepartmentInfoSource.asObservable();

  private groupAccountInfoSource = new BehaviorSubject<Array<FieldOption>>(new Array<FieldOption>());
  public groupAccountInfo$ = this.groupAccountInfoSource.asObservable();

  public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 1, field: 'SerialNumber' }];

  public defaultBuildingSortTerms = [<BuildingSortTermDto>{ termOrder: 0, sortDirection: 1, field: 'buildingName' }];
  public defaultBuildingFilterTerms = [];
  groupSiteInfo: BuildingHierarchyDto;
  groupDepartmentOptions: Array<FieldOption>;
  activityCodeOptions: Array<FieldOption>;
  accountOptions: Array<FieldOption>;
  depreciationConventionOptions: Array<FieldOption>;
  depreciationMethodOptions: Array<FieldOption>;

  status: QualityControlStatusDto;
  buildingSelectionOptions: CascadedSelectOption[];

  userTimeZone = moment.tz.guess(true);
  minDate = moment.utc('1900-01-02');

  constructor(
    private inventoryApiService: InventoryApiService,
    private insuranceApiService: InsuranceApiService,
    private qualityControlApiService: QualityControlApiService,
    private referenceDataApiService: ReferenceDataApiService,
    private groupService: GroupApiService,
    private assetFileInfoService: AssetFileInfoService
  ) {}

  public updateData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<AssetSortTermDto>(),
    filterTerms: Array<AssetFilterTermDto> = new Array<AssetFilterTermDto>(),
    source: string = null
  ): Observable<AssetSearchResponseDto> {
    const defaultFilter = <FilterDto>{
      term: <Term>{ dataTarget: this.dataTarget, field: '', value: '' },
      operation: 'noop'
    };

    const searchRequest = <AssetSearchDto>{
      fieldMatchTerms: [],
      fieldMatchConjunction: 'and',
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : [defaultFilter],
      filterConjunction: 'and',
      excludeMatchedRecords: false,
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultSortTerms,
      skip: skip,
      take: take,
      source: source
    };

    return this.inventoryApiService.search(groupId, searchRequest);
  }

  public getSearchMetadataByGroupId(groupId: string, fileType): Observable<AssetFileSummaryDto> {
    return this.inventoryApiService.getSearchMetadataByGroupId(groupId, fileType);
  }

  public getConsolidatedFilePreview(groupId: string): Observable<ApiServiceResult<Array<ConsolidatedFilePreviewDto>>> {
    return this.inventoryApiService.getConsolidatedFilePreview(groupId);
  }

  public getAccountData(groupId: string): Observable<Array<AccountDto>> {
    return this.inventoryApiService.getAccountsByGroupId(groupId);
  }

  public getDepartmentData(groupId: string): Observable<Array<DepartmentDto>> {
    return this.inventoryApiService.getDepartmentsByGroupId(groupId);
  }

  public getStatus(groupId: string): Observable<QualityControlStatusDto> {
    {
      return this.qualityControlApiService.getStatus(groupId);
    }
  }

  public getBuildingSearchMetadataByGroupId(groupId: string): Observable<AssetFileSummaryDto> {
    return this.insuranceApiService.getBuildingSearchMetadataByGroupId(groupId);
  }

  public getActivityCodes(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getActivityCodes();
  }

  public getDepreciationConventions(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getDepreciationConventions();
  }

  public getDepreciationMethods(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getDepreciationMethods();
  }

  public hasFiscalYearEnd(): Observable<boolean> {
    return this.groupService.getGroup(this.groupId).pipe(map(g => g.fiscalYearEnd !== null));
  }

  public getAttributeTypesAndCodes(): Observable<ApiServiceResult<Array<AttributeTypesAndCodesResult>>> {
    return this.referenceDataApiService.getAttributeTypesAndCodes();
  }

  public updateBuildingData(
    groupdId: string,
    skip: number,
    take: number,
    sortTerms: Array<BuildingSortTermDto> = new Array<BuildingSortTermDto>(),
    filterTerms: Array<BuildingFilterTermDto> = new Array<BuildingFilterTermDto>()
  ): Observable<BuildingResponseDto> {
    const searchRequest = <BuildingSearchDto>{
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : this.defaultBuildingFilterTerms,
      filterConjunction: 'and',
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultBuildingSortTerms,
      skip: skip,
      take: take
    };

    return this.insuranceApiService.searchBuildingsByGroup(groupdId, searchRequest);
  }

  public updateGroupSiteInfo(groupSiteInfo: Array<CascadedSelectOption>) {
    this.groupSiteInfoSource.next(groupSiteInfo);
  }

  public updateGroupDepartmentInfo(groupDepartmentsInfo: Array<FieldOption>) {
    this.groupDepartmentInfoSource.next(groupDepartmentsInfo);
  }

  public updateGroupAccountInfo(groupAccountsInfo: Array<FieldOption>) {
    this.groupAccountInfoSource.next(groupAccountsInfo);
  }

  public updateCachedRecord(asset: Asset, dataTarget: DataTargetName): Observable<boolean> {
    const current = this.cachedRecordsSource.getValue();

    if (asset && current[dataTarget]) {
      const index = current[dataTarget].findIndex(i => i.assetId === asset.assetId);
      if (index !== -1) {
        for (const [key, value] of Object.entries(current[dataTarget][index])) {
          if (key !== 'assetId' && key !== 'id' && asset[key]) {
            current[dataTarget][index][key] = asset[key];
          }
        }
      }
    }
    this.cachedRecordsSource.next(current);
    return of(true);
  }

  public createCachedRecord(asset: Asset, dataTarget: DataTargetName): Observable<boolean> {
    const current = this.cachedRecordsSource.getValue();

    if (asset && current[dataTarget]) {
      let newAsset: Asset;
      if (current[dataTarget][0]) {
        // TODO: Var is forbidden in typescript use const or let
        newAsset = Object.assign({}, current[dataTarget][0]);
        for (const [key, value] of Object.entries(newAsset)) {
          newAsset[key] = asset[key];
        }
      }
      newAsset.isMatched = false;
      newAsset.isChild = false;
      newAsset.isParent = false;
      newAsset.dataSource = dataTarget;
      current[dataTarget].unshift(newAsset);
    }
    this.cachedRecordsSource.next(current);
    return of(true);
  }

  public calculateContentCostReproductionNew(contentCode: string, contentQuality: number, floorArea: number): Observable<string> {
    return this.qualityControlApiService
    .calculateContentCostReproductionNew(contentCode, contentQuality, floorArea).pipe(map(c => c.result));
  }

  public calculateBasementFloorArea(basementFinishedArea: number, basementUnfinishedArea: number): Observable<string> {
    return this.qualityControlApiService.calculateBasementFloorArea(basementFinishedArea, basementUnfinishedArea).pipe(map(c => c.result));
  }

  // TODO - Can be invoked from all the places that don't have piped date time values.
  public convertToCurrentTimeZone(inputDate: string): string {
    if (!moment(inputDate).isValid() || moment.utc(inputDate).isBefore(this.minDate)) {
      return '';
    }
    return moment.utc(inputDate).tz(this.userTimeZone).format('YYYY-MM-DDThh:mm:ss');
  }

  public mapDepartments(departments: DepartmentDto[]): ReplaceFieldSelectionInfo {
    const selection = <ReplaceFieldSelectionInfo> {
      fieldNames: this.assetFileInfoService.GetDepartmentColumns(),
      values: new Array<ReplaceFieldSelectionOption>()
    };
    departments.forEach(dep => {
      const option = <ReplaceFieldSelectionOption> {
        name: dep.departmentNumber + ' - ' + dep.description,
        value: dep.id
      };
      selection.values.push(option);
    });
    return selection;
  }

  public mapAccounts(accounts: AccountDto[]): ReplaceFieldSelectionInfo {
    const selection = <ReplaceFieldSelectionInfo> {
      fieldNames: this.assetFileInfoService.GetAccountColumns(),
      values: new Array<ReplaceFieldSelectionOption>()
    };
    accounts.forEach(act => {
      const option = <ReplaceFieldSelectionOption> {
        name: act.accountNumber + ' - ' + act.accountDescription,
        value: act.id
      };
      selection.values.push(option);
    });
    return selection;
  }

  public mapSiteAttributeTypesAndCodes(siteAttributeTypesAndCodes: Array<AttributeTypesAndCodesResult>):  Array<ReplaceFieldSelectionInfo> {
    const selectionArr = new Array<ReplaceFieldSelectionInfo>();
    siteAttributeTypesAndCodes.forEach((siteAttributeTypeAndCode) => {
      const camelCaseFieldName = siteAttributeTypeAndCode.name[0].toLowerCase()+siteAttributeTypeAndCode.name.substring(1);
      const selection = <ReplaceFieldSelectionInfo>{
        fieldNames: [camelCaseFieldName],
        values: new Array<ReplaceFieldSelectionOption>(),
      };

      siteAttributeTypeAndCode.options.forEach((element) => {
        const options = <ReplaceFieldSelectionOption>{
          name: element.description,
          value: element.buildingAttributeCodeId,
        };
        selection.values.push(options);
      });
      selectionArr.push(selection);
    });
    return selectionArr;
  }
}
