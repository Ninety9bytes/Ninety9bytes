
import {map} from 'rxjs/operators';
import { FilterOperationsService } from './filter-operations.service';
import { UserStore } from '../user/user.store';
import { UserGridService, GridSetting } from './user-grid.service';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataItemValue } from '../../_models/data-item-value.model';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';
import { BuildingSortTermDto } from '../../_api/_runtime/dtos/building-sort-term.dto';
import { ContractSortTermDto,
  ContractFilterTermDto, ContractSearchTermDto } from '../../_api/_runtime/dtos/contract/contract-search-filter-dto';
import { BuildingFilterTermDto } from '../../_api/_runtime/dtos/building-filter-term.dto';
import { AssetFilterTermDto } from '../../_api/_runtime/dtos/asset-filter-term.dto';
import { IntlService } from '@progress/kendo-angular-intl';
import { ApiService } from '../../_api/services/api.service';
import { ConfigService } from '@ngx-config/core';
import { DataTargetName } from '../../_enums/data-target-name';
import { FamisGridCacheResult, FamisGridCacheWindow } from '../../_models/shared/famis-grid-cache-result.model';
import { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { AssetSearchTermDto } from '../../_api/_runtime/dtos/asset-search-term.dto';
import { BuildingSearchTermDto } from '../../_api/_runtime/dtos/building-search-term.dto';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { FieldType } from '../../_enums/field-type';
import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';

@Injectable()
export class FamisGridService {
  // Usage of Any type is by design as Grid can present a collection of any datatype
  private cachedRecordsSource = new BehaviorSubject<Array<Array<any>>>(new Array<Array<any>>());
  public cachedRecords$ = this.cachedRecordsSource.asObservable();

  private editedRecordsSource = new BehaviorSubject<Array<DataItemValue>>(new Array<DataItemValue>());
  public editedRecords$ = this.editedRecordsSource.asObservable();

  private editedRecordsWithErrorsSource = new BehaviorSubject<Array<DataItemValue>>(new Array<DataItemValue>());
  public editedRecordsWithErrors$ = this.editedRecordsWithErrorsSource.asObservable();

  public windowSize = 250;
  public cacheSize = 250;

  public defaultSkip = 0;
  public defaultTake = 250;

  public totalRecordCounts = new Array<number>();

  public currentSort = new Array<Array<AssetSortTermDto | BuildingSortTermDto | ContractSortTermDto>>();
  public filterTerms = new Array<
    Array<AssetFilterTermDto | BuildingFilterTermDto | ContractFilterTermDto>
  >();

  private lastCachedIndexSource = new Array<number>();
  public userId: string;
  public userGridSettingsName: string;

  constructor(
    private filterOperationsService: FilterOperationsService,
    private intl: IntlService,
    private apiService: ApiService,
    private configService: ConfigService,
    private userStore: UserStore,
    private userGridService: UserGridService
  ) {}

  public setUserId(): void {
    this.userStore.user.subscribe(user => {
      this.userId = user.profile.IdentityId.toString();
    });
  }

  public setUserGridFilterSettings(
    dataSource: DataTargetName,
    routeUrl: string,
    gridName: string,
    gridSelectedHeaders: string[]): Observable<GridSetting> {
      this.setUserGridSettingName(dataSource ? dataSource.toString() : null, routeUrl, gridName);
      this.userGridSettingsName = this.userId + this.userGridSettingsName;
      return this.userGridService.getSettings(this.userId, this.userGridSettingsName, gridSelectedHeaders);
  }

  public setUserGridSettingName(dataSource: string, routeUrl: string, gridName: string): void {
    this.userGridSettingsName = this.userGridService.createUserGridId(
      dataSource,
      routeUrl,
      gridName
    );
  }

  update(
    gridId: number,
    skip: number,
    take: number,
    totalRecordCount: number,
    sortTerms: AssetSortTermDto[] | BuildingSortTermDto[],
    clearCache: boolean = false
  ): Observable<FamisGridCacheResult> {
    const s = this;

    return Observable.create(function(observer) {
      const result = <FamisGridCacheResult>{
        gridId: gridId,
        updateCache: true,
        cachedData: null,
        filters: s.filterTerms.length > 0 ? s.filterTerms[gridId] : null,
        sortTerms: s.currentSort.length > 0 ? s.currentSort[gridId] : null,
        cacheWindow: s.calculateCacheRecords(gridId, skip, totalRecordCount)
      };

      observer.next(result);
      observer.complete();
    });
  }

  public clearEditedRecords() {
    this.editedRecordsSource.next(new Array<DataItemValue>());
    this.editedRecordsWithErrorsSource.next(new Array<DataItemValue>());
  }

  public addEditedRecord(itemId: string, dataItem: any) {
    let current = this.editedRecordsSource.getValue();

    if (!Array.isArray(current)) {
      current = new Array<DataItemValue>();
    }

    current.push({ itemId: itemId, dataItem: dataItem });

    console.log(current, 'Add edited record');

    this.editedRecordsSource.next(current);
  }

  public addRecordsWithErrors(itemId: string, dataItem: any) {
    let current = this.editedRecordsWithErrorsSource.getValue();

    if (!Array.isArray(current)) {
      current = new Array<DataItemValue>();
    }

    const index = current.findIndex(c => c.itemId === itemId);

    if (index === -1) {
      current.push({ itemId: itemId, dataItem: dataItem });
    }

    this.editedRecordsWithErrorsSource.next(current);
  }

  public removeEditedRecord(itemId: string) {
    let current = this.editedRecordsSource.getValue();

    if (!Array.isArray(current)) {
      current = new Array<DataItemValue>();
    }

    const index = current.findIndex(c => c.itemId === itemId);

    current.splice(index, 1);

    this.editedRecordsSource.next(current);
  }

  public removeRecordWithErrors(itemId: string) {
    let current = this.editedRecordsWithErrorsSource.getValue();

    if (!Array.isArray(current)) {
      current = new Array<DataItemValue>();
    }

    const index = current.findIndex(c => c.itemId === itemId);

    if (index !== -1) {
      current.splice(index, 1);
    }

    this.editedRecordsWithErrorsSource.next(current);
  }

  public createGrid(): number {
    const current = this.cachedRecordsSource.getValue();

    // Usage of Any type is by design as Grid can present a collection of any datatype
    current.push(new Array<any>());

    this.cachedRecordsSource.next(current);

    return current.length - 1;
  }
  // Usage of Any type is by design as Grid can present a collection of any datatype
  public setCacheRecords(gridData: Array<any>, gridId: number, skip: number, totalRecordCount: number, take: number) {
    const current = this.cachedRecordsSource.getValue();

    current[gridId] = gridData;
    this.cachedRecordsSource.next(current);

    this.lastCachedIndexSource[gridId] = skip + take;

    this.totalRecordCounts[gridId] = totalRecordCount;
  }

  public mapFilterTerms(kendoFilters: CompositeFilterDescriptor, gridId: number, dataTarget: DataTargetName): Observable<boolean> {
    const s = this;

    s.resetFilters();

    let success = false;

    if (kendoFilters) {
      const filters = <CompositeFilterDescriptor[]>kendoFilters.filters;

      [].concat.apply([], filters.map(c => c.filters || c)).forEach(filter => {
        if (Array.isArray(filter.value)) {
          this.filterTerms[gridId] = [...this.filterTerms[gridId], ...this.consturctAssetFilterTermArray(filter.value, dataTarget)];
        } else if (typeof filter.value === 'string') {
          this.filterTerms[gridId] = [...this.filterTerms[gridId], this.constructContractFilterTerm(filter)];
        }
        success = true;
      });
    }

    return of(success);
  }

  private consturctAssetFilterTermArray(filterTerms: FilterDescriptor[], dataTarget: DataTargetName) {
    let assetFilterTermArray = Array<AssetFilterTermDto>();

    filterTerms.forEach(term => {
      assetFilterTermArray = [
        ...assetFilterTermArray,
        {
          term: <AssetSearchTermDto>{
            dataTarget: dataTarget,
            field: term.field.toString(),
            value: term.value
          },
          operation: term.operator.toString()
        }
      ];
    });

    return assetFilterTermArray;
  }

  private constructContractFilterTerm(filterTerm: FilterDescriptor) {
    return <ContractFilterTermDto>{
      operation: filterTerm.operator,
      term: <ContractSearchTermDto>{
        field: filterTerm.field,
        value: filterTerm.value
      }
    };
  }

  public mapBuildingFilterTerms(kendoFilters: CompositeFilterDescriptor, gridId: number): Observable<boolean> {
    const s = this;

    s.resetFilters();

    const tempFilter = this.filterTerms[gridId];
    let success = false;

    if (kendoFilters) {
      kendoFilters.filters.forEach(d => {
        const filterDescriptor = <CompositeFilterDescriptor>d;

        filterDescriptor.filters.forEach(f => {
          const kendoFilter = <FilterDescriptor>f;

          const filterOperation = this.filterOperationsService.mapKendoFilterOperation(kendoFilter.operator.toString());

          if (filterOperation !== 'notsupported') {
            const buildingFilterTerm = <BuildingFilterTermDto>{
              term: <BuildingSearchTermDto>{
                field: kendoFilter.field.toString(),
                value: kendoFilter.value
              },
              operation: filterOperation
            };

            this.filterTerms[gridId].push(buildingFilterTerm);
            success = true;
          }
        });
      });
    }

    return of(success);
  }

  mapToTypedValues(dataItem: any, headers: GridColumnHeader[]): any {
    const props = Object.keys(dataItem);
    const dateHeaders = headers.filter(c => c.fieldType === 'date' || c.fieldType === FieldType.Date
      || c.fieldType === FieldType.DateTime);

    const numericHeaders = headers.filter(c => c.fieldType === 'numeric' ||
       c.fieldType === FieldType.Double || c.fieldType === FieldType.Integer || c.fieldType === FieldType.Percent);

    props.forEach(property => {
      if (dateHeaders.findIndex(c => c.name === property) !== -1) {
        const date = this.intl.parseDate(dataItem[property]);

        dataItem[property] = this.intl.toString(date, 'MM/dd/yyyy');
      }

      if (numericHeaders.findIndex(c => c.name === property) !== -1) {
        dataItem[property] = this.intl.parseNumber(dataItem[property], 'n', 'en');
      }
    });

    return dataItem;
  }

  public resetFilters(): void {
    const current = this.cachedRecordsSource.getValue();

    this.filterTerms = new Array<Array<AssetFilterTermDto | BuildingFilterTermDto>>();

    current.forEach(cachedRecord => {
      this.filterTerms.push(new Array<AssetFilterTermDto | BuildingFilterTermDto>());
    });
  }

  public resetCache(): void {
    let current = this.cachedRecordsSource.getValue();

    // Usage of Any type is by design as Grid can present a collection of any datatype
    current = new Array<Array<any>>();

    this.cachedRecordsSource.next(current);
  }

  private calculateCacheRecords(gridId: number, skip: number, recordCount: number): FamisGridCacheWindow {
    let take = this.cacheSize;

    if (recordCount <= this.cacheSize) {
      take = recordCount;
    }

    if (recordCount > this.cacheSize && skip === 0) {
      take = this.cacheSize;
    }

    if (recordCount > this.cacheSize && skip > this.cacheSize) {
      take = this.cacheSize;
    }

    return <FamisGridCacheWindow>{ skip: skip, take: !take ? this.defaultTake : take };
  }

  public AddAssetCustomColumns(
    fileId: string,
    columns: CreateAssetFileCustomColumnDto[]
  ): Observable<ApiServiceResult<CreateAssetFileCustomColumnDto[]>> {
    return this.apiService
      .post(`${this.configService.getSettings('runtimeApiEndpoint')}/Inventory/AssetFiles/${fileId}/CustomColumns`, columns).pipe(
      map(result => <ApiServiceResult<Array<CreateAssetFileCustomColumnDto>>>result));
  }

  public AddBuildingCustomColumns(
    groupId: string,
    columns: CreateAssetFileCustomColumnDto[]
  ): Observable<CreateAssetFileCustomColumnDto[]> {
    return this.apiService
      .post(`${this.configService.getSettings('runtimeApiEndpoint')}/Insurance/group/${groupId}/CustomColumns`, columns).pipe(
      map(result => <Array<CreateAssetFileCustomColumnDto>>result));
  }

  public DeleteAssetCustomColumn(
    fileId: string,
    customColumnName: string
  ): Observable<ApiServiceResult<CreateAssetFileCustomColumnDto[]>> {
    return this.apiService
      .delete(`${this.configService.getSettings('runtimeApiEndpoint')}/Inventory/AssetFiles/${fileId}/CustomColumn/${customColumnName}`);
  }

  public DeleteBuildingCustomColumn(
    groupId: string,
    customColumnName: string
  ): Observable<any> {
    return this.apiService
      .delete(`${this.configService.getSettings('runtimeApiEndpoint')}/Insurance/group/${groupId}/CustomColumn/${customColumnName}`);
  }

  public IsBuildingCustomColumnEmpty(
    groupId: string,
    customColumnName: string
  ): Observable<any> {
    return this.apiService
      .get(`${this.configService.getSettings('runtimeApiEndpoint')}/Insurance/group/${groupId}/CustomColumn/${customColumnName}`);
  }

  public IsAssetCustomColumnEmpty(
    fileId: string,
    customColumnName: string
  ): Observable<any> {
    return this.apiService
      .get(`${this.configService.getSettings('runtimeApiEndpoint')}/Inventory/AssetFiles/${fileId}/CustomColumn/${customColumnName}`);
  }
}
