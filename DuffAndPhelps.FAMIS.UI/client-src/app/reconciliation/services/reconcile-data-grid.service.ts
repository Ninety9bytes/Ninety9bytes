import { FilterOperationsService } from '../../_core/services/filter-operations.service';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Asset } from '../../_models/asset.model';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { AssetSearchResponseDto,
  AssetSortTermDto, AssetFilterTermDto, AssetSearchDto, AssetSearchTermDto } from '../../_api/dtos/inventory/asset-search.dto';
import { InventoryService as ReconInventoryService } from '../../_api/services/reconciliation/inventory.service';
import { DataTargetName } from '../../_enums/data-target-name';
import { AssetFileRecordDto } from '../../_api/dtos/asset-file-record-dto';
import { AssetDto } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { ReconciliationMatchType } from '../../_enums/reconciliation-match-type';
import { FormGroup } from '@angular/forms';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';

@Injectable()
export class ReconcileDataGridService {

  private clearSelectionsSource = new BehaviorSubject<boolean>(false);

  private unsavedEditsSource = new BehaviorSubject<Array<Array<Asset>>>(new Array<Array<Asset>>());

  private cachedRecordsSource = new BehaviorSubject<Array<Array<Asset>>>(new Array<Array<Asset>>());
  private recordCountSource = new BehaviorSubject<Array<number>>(new Array<number>());
  private headersSource = new BehaviorSubject<Array<Array<GridColumnHeader>>>(new Array<Array<GridColumnHeader>>());
  private selectedHeadersSource = new BehaviorSubject<Array<Array<string>>>(new Array<Array<string>>());
  private excludeMatchSource = new BehaviorSubject<Array<boolean>>(new Array<boolean>());
  private pendingCustomColumnsSouce = new BehaviorSubject<Array<Array<CreateAssetFileCustomColumnDto>>>(
    new Array<Array<CreateAssetFileCustomColumnDto>>()
  );
  private availableColumnSource = new BehaviorSubject<Array<GridColumnHeader>>(new Array<GridColumnHeader>());

  private lastCachedIndexSource = new Array<number>();

  public clearSelections$ = this.clearSelectionsSource.asObservable();
  public cachedRecords$ = this.cachedRecordsSource.asObservable();
  public recordCounts$ = this.recordCountSource.asObservable();
  public headers$ = this.headersSource.asObservable();
  public selectedHeaders$ = this.selectedHeadersSource.asObservable();
  public unsavedEdits$ = this.unsavedEditsSource.asObservable();
  public pendingCustomColumns$ = this.pendingCustomColumnsSouce.asObservable();
  public availableColumns$ = this.availableColumnSource.asObservable();
  public groupId: string;

  public windowSize = 100;
  public cacheSize = 100;
  public currentSort = new Array<Array<AssetSortTermDto>>();
  public filterTerms = new Array<Array<AssetFilterTermDto>>();

  public defaultHeaders = [
    <GridColumnHeader>{ name: 'serialNumber', order: 1 },
    <GridColumnHeader>{ name: 'assetTagNumber', order: 2 },
    <GridColumnHeader>{ name: 'description', order: 3 },
    <GridColumnHeader>{ name: 'modelNumber', order: 4 },
    <GridColumnHeader>{ name: 'manufacturer', order: 5 },
    <GridColumnHeader>{ name: 'buildingName', order: 6 },
    <GridColumnHeader>{ name: 'floor', order: 7 },
    <GridColumnHeader>{ name: 'quantity', order: 8 },
    <GridColumnHeader>{ name: 'historicalCost', order: 9 }
  ];

  constructor(
    private inventoryRepository: ReconInventoryService,
    private filterOperationsService: FilterOperationsService,
    private referenceDataApiService: ReferenceDataApiService) {
    this.clearRecordCounts();
    this.clearAllPendingColumns();
  }

  update(
    dataSource: number,
    skip: number,
    take: number,
    totalRecordCount: number,
    sortTerms: AssetSortTermDto[],
    clearCache: boolean = false
  ): Observable<ReconcileDataGridResult> {
    const s = this;

    const lastCachedIndex = s.lastCachedIndexSource[dataSource] ? s.lastCachedIndexSource[dataSource] : 0;

    return Observable.create(function(observer) {
      const currentCachedRecords = s.cachedRecordsSource.getValue();

      
      s.search(s.groupId, dataSource, skip, s.cacheSize, sortTerms, s.filterTerms[dataSource]).subscribe(result => {
        const assets = s.init(result, dataSource);

        s.setCacheRecords(assets, dataSource, skip, totalRecordCount);

        observer.next(
          <ReconcileDataGridResult> { assets: assets, totalInRecordSet: result.totalInRecordSet, allAssetIds: result.allAssetIds });
        observer.complete();
      });
    });
  }

  search(
    groupId: string,
    dataTarget: number,
    skip: number,
    take: number,
    sortTerms: AssetSortTermDto[],
    filters: AssetFilterTermDto[],
    excludeMatches: boolean = false
  ): Observable<AssetSearchResponseDto> {
    const searchFilter = <AssetSearchDto>{
      fieldMatchTerms: [],
      fieldMatchConjunction: 'and',
      filterTerms: filters,
      filterConjunction: 'and',
      excludeMatchedRecords: excludeMatches ? excludeMatches : this.excludeMatchSource.getValue()[dataTarget],
      sortTerms: sortTerms,
      skip: skip,
      take: take,
      includeAllAssetIds: true
    };

    this.currentSort[dataTarget] = sortTerms;

    return this.inventoryRepository.search(groupId, searchFilter);
  }

  public init(searchResponse: AssetSearchResponseDto, dataSource: number): Array<Asset> {
    const assets = new Array<Asset>();

    if (!searchResponse.assets || searchResponse.assets.length === 0) {
      return assets;
    }

    searchResponse.assets.forEach(a => {
      const asset = <Asset>{
        assetId: a.assetId,
        dataSource: dataSource,
        isMatched: !!a.matchCodeId,
        isParent: a.parentId === a.assetId,
        isChild: !!a.parentId && a.parentId !== a.assetId,
        matchCodeId: a.matchCodeId,
        matchCodeName: a.matchCodeName
      };

      for (const [key, value] of Object.entries(a.assetData)) {
        asset[key] = value;
        asset.imageCollection = !!asset.assetImages ? asset.assetImages : [];
      }

      assets.push(asset);
    });

    return assets;
  }

  setCacheRecords(assets: Array<Asset>, dataTarget: number, skip: number, recordCount: number) {
    const current = this.cachedRecordsSource.getValue();
    current[dataTarget] = assets;
    this.cachedRecordsSource.next(current);
    // TODO Remove ternary logic, skip + this.windowSize is all that is needed.
    // If we keep this, create a private method updateCache that sets the last cached index value once.
    this.lastCachedIndexSource[dataTarget] = skip + this.windowSize;
  }

  updateHeaders(headers: Array<GridColumnHeader>, dataTarget: number, defaultSort: boolean = false): void {
    const current = this.headersSource.getValue();
    current[dataTarget] = headers;
    this.headersSource.next(current);
  }

  addHeader(name: string, dataSource: number) {
    const current = this.headersSource.getValue();

    const index = current[dataSource].findIndex(c => c.name === name);

    if (index === -1) {
      const column = <GridColumnHeader>{
        name: name,
        order: current[dataSource][current[dataSource].length - 1].order + 1,
        isCustom: true
      };
      current[dataSource].push(column);
    }

    this.headersSource.next(current);
  }

  updateSelectedHeaders(selectedHeaders: Array<string>, dataTarget: number): void {
    const current = this.selectedHeadersSource.getValue();

    current[dataTarget] = selectedHeaders;

    this.selectedHeadersSource.next(current);
  }
  updateAvailableColumns(availableColumns: Array<GridColumnHeader>, dataTarget: number): void {
    this.availableColumnSource.next(availableColumns);
  }
  clearAvailableColumns(): void {
     let currentHeaders = this.availableColumnSource.getValue();
    currentHeaders = new Array<GridColumnHeader>();
    this.availableColumnSource.next(currentHeaders);
  }
  clearHeaders(): void {
    let currentHeaders = this.headersSource.getValue();

    currentHeaders = new Array<Array<GridColumnHeader>>();

    currentHeaders[DataTargetName.client] = new Array<GridColumnHeader>();
    currentHeaders[DataTargetName.inventory] = new Array<GridColumnHeader>();

    this.headersSource.next(currentHeaders);
  }

  addPendingColumn(dataTarget: number, column: CreateAssetFileCustomColumnDto) {
    const currentCustomColumns = this.pendingCustomColumnsSouce.getValue();
    currentCustomColumns[dataTarget].push(column);
    this.pendingCustomColumnsSouce.next(currentCustomColumns);
  }

  clearPendingColumns(dataTarget: number) {
    const currentPendingColumns = this.pendingCustomColumnsSouce.getValue();
    currentPendingColumns[dataTarget] = new Array<CreateAssetFileCustomColumnDto>();
    this.pendingCustomColumnsSouce.next(currentPendingColumns);
  }

  clearAllPendingColumns() {
    let currentPendingColumns = this.pendingCustomColumnsSouce.getValue();
    currentPendingColumns = new Array<Array<CreateAssetFileCustomColumnDto>>();
    currentPendingColumns[DataTargetName.client] = new Array<CreateAssetFileCustomColumnDto>();
    currentPendingColumns[DataTargetName.inventory] = new Array<CreateAssetFileCustomColumnDto>();
    this.pendingCustomColumnsSouce.next(currentPendingColumns);
  }

  clearSelectedHeaders(): void {
    let currentSelectedHeaders = this.selectedHeadersSource.getValue();

    currentSelectedHeaders = new Array<Array<string>>();

    currentSelectedHeaders[DataTargetName.client] = new Array<string>();
    currentSelectedHeaders[DataTargetName.inventory] = new Array<string>();

    this.selectedHeadersSource.next(currentSelectedHeaders);
  }

  public updateCachedRecord(asset: Asset, dataTarget: DataTargetName): Observable<boolean> {
    const current = this.cachedRecordsSource.getValue();
    if (asset && current[dataTarget]) {
      const index = current[dataTarget].findIndex(i => i.assetId === asset.assetId);
      if (index !== -1) {
        for (const [key, value] of Object.entries(current[dataTarget][index])) {
          if (key !== 'assetId' && key !== 'id' && asset[key]) {
            current[dataTarget][index][key] = asset[key];

            current[dataTarget][index].imageCollection = !!current[dataTarget][index].assetImages
              ? current[dataTarget][index].assetImages
              : [];
          }
        }
      }
    }
    this.cachedRecordsSource.next(current);
    return of(true);
  }

  public createCachedRecord(asset: AssetFileRecordDto, dataTarget: DataTargetName): Observable<boolean> {
    const current = this.cachedRecordsSource.getValue();

    const newAsset = Object.assign({}, current[dataTarget][0]);
    if (asset && current[dataTarget]) {
      if (current[dataTarget][0]) {
        for (const [key, value] of Object.entries(newAsset)) {
          newAsset[key] = asset[key];
        }
      }

      newAsset.isMatched = false;
      newAsset.isChild = false;
      newAsset.isParent = false;
      newAsset.dataSource = dataTarget;
      newAsset.assetId = asset.id;

      current[dataTarget].unshift(newAsset);
    }
    this.cachedRecordsSource.next(current);
    return of(true);
  }

  public retrieveCacheRecords(groupId: string, dataTarget: number, skip: number, recordCount: number) {
    let take = this.cacheSize;

    if (recordCount <= this.cacheSize) {
      take = recordCount;
    }

    if (recordCount > this.cacheSize && skip === 0) {
      take = this.cacheSize;
    }

    if (recordCount > this.cacheSize && skip > this.cacheSize) {
      skip = skip - this.cacheSize / 2;
      take = this.cacheSize;
    }

    return this.search(groupId, dataTarget, skip, take, this.currentSort[dataTarget], this.filterTerms[dataTarget]).subscribe(response => {
      // const current = this.cachedRecordsSource.getValue();

      // current[dataTarget] = this.init(response, dataTarget);

      this.setCacheRecords(this.init(response, dataTarget), dataTarget, skip, recordCount);

      // this.cachedRecordsSource.next(current);
      // TODO Remove ternary logic, skip + take is all that is needed.
      // If we keep this, create a private method updateCache that sets the last cached index value once.
      // this.lastCachedIndexSource[dataTarget] = skip + take >= recordCount ? recordCount : skip + take;
    });
  }

  public updateCacheRecords(entities: Array<AssetDto>, matchType: ReconciliationMatchType) {
    const current = this.cachedRecordsSource.getValue();

    if (entities && entities.length > 0) {
      entities.forEach(entity => {
        if (current[DataTargetName.client]) {
          const clientIndex = current[DataTargetName.client].findIndex(c => c.assetId === entity.id);
          if (clientIndex !== -1) {
            current[DataTargetName.client][clientIndex] = this.mapAsset(
              current[DataTargetName.client][clientIndex],
              entity,
              matchType
            );
          }
        }

        if (current[DataTargetName.inventory]) {
          const inventoryIndex = current[DataTargetName.inventory].findIndex(c => c.assetId === entity.id);

          if (inventoryIndex !== -1) {
            current[DataTargetName.inventory][inventoryIndex] = this.mapAsset(
              current[DataTargetName.inventory][inventoryIndex],
              entity,
              matchType
            );
          }
        }
      });

      this.cachedRecordsSource.next(current);
    }
  }

  public clearCachedRecords(): void {
    this.cachedRecordsSource.next(new Array<Array<Asset>>());
  }

  public updateRecordCount(dataTarget: number, count: number) {
    const current = this.recordCountSource.getValue();
    current[dataTarget] = count;

    this.recordCountSource.next(current);
  }

  public clearRecordCounts(): void {
    const current = this.recordCountSource.getValue();

    current[DataTargetName.client] = 0;
    current[DataTargetName.inventory] = 0;

    this.recordCountSource.next(current);
  }

  public resetFilters(dataTarget: number, clearBothGridFilters: boolean): void {
    const current = this.filterTerms;
    if (dataTarget !== null) {
      if (dataTarget === DataTargetName.client) {
        this.filterTerms[DataTargetName.client] = [
          <AssetFilterTermDto>{ term: <AssetSearchTermDto>{ dataTarget: DataTargetName.client }, operation: 'noop' }
        ];
      } else if (dataTarget === DataTargetName.inventory) {
        this.filterTerms[DataTargetName.inventory] = [
          <AssetFilterTermDto>{ term: <AssetSearchTermDto>{ dataTarget: DataTargetName.inventory }, operation: 'noop' }
        ];
      }
    } else {
      if (clearBothGridFilters) {
        this.filterTerms[DataTargetName.client] = [
          <AssetFilterTermDto>{ term: <AssetSearchTermDto>{ dataTarget: DataTargetName.client }, operation: 'noop' }
        ];
        this.filterTerms[DataTargetName.inventory] = [
          <AssetFilterTermDto>{ term: <AssetSearchTermDto>{ dataTarget: DataTargetName.inventory }, operation: 'noop' }
        ];
      }
    }
  }

  public clearSelectionsInProgress(): void {
    this.clearSelectionsSource.next(true);
  }

  public clearSelectionsComplete(): void {
    this.clearSelectionsSource.next(false);
  }


  public clearEditInProgress(dataTarget: DataTargetName): void {
    const current = this.unsavedEditsSource.getValue();

    current[dataTarget] = new Array<Asset>();

    this.unsavedEditsSource.next(current);
  }

  public saveEditInProgress(formGroup: FormGroup, asset: Asset, dataTarget: DataTargetName) {
    const currentUnsavedEdits = this.unsavedEditsSource.getValue();
    const currentCachedData = this.cachedRecordsSource.getValue();

    const currentAsset = currentCachedData[dataTarget].find(c => c.assetId === asset.assetId);
    const currentAssetIndex = currentCachedData[dataTarget].findIndex(c => c.assetId === asset.assetId);

    if (currentAsset) {
      const updatedAsset = Object.assign(currentAsset, formGroup.value);

      updatedAsset.isEdited = true;

      if (!currentUnsavedEdits[dataTarget]) {
        currentUnsavedEdits[dataTarget] = new Array<Asset>();
      }

      const unsavedEditIndex = currentUnsavedEdits[dataTarget].findIndex(c => c.assetId === updatedAsset.assetId);

      if (unsavedEditIndex === -1) {
        currentUnsavedEdits[dataTarget].push(updatedAsset);
        currentCachedData[dataTarget][currentAssetIndex] = updatedAsset;
      } else {
        currentUnsavedEdits[dataTarget][unsavedEditIndex] = updatedAsset;
      }

      this.unsavedEditsSource.next(currentUnsavedEdits);
      this.cachedRecordsSource.next(currentCachedData);

      // console.log(currentUnsavedEdits[dataTarget]);
    }
  }

  private defaultSort(headers: GridColumnHeader[]): GridColumnHeader[] {
    let orderCount = this.defaultHeaders[this.defaultHeaders.length - 1].order + 1;

    this.defaultHeaders.forEach(defaultHeader => {
      const index = headers.findIndex(c => c.name === defaultHeader.name);

      if (index !== -1) {
        headers[index] = defaultHeader;
      }
    });

    headers.forEach(header => {
      if (!header.order) {
        header.order = orderCount;
      }

      orderCount++;
    });

    return headers;
  }

  public toggleShowMatchedRecords(excludeMatches: boolean, dataTarget: number): void {
    const current = this.excludeMatchSource.getValue();

    current[dataTarget] = excludeMatches;

    this.excludeMatchSource.next(current);
  }

  public mapFilterTerms(kendoFilters: CompositeFilterDescriptor, dataTarget: number): Observable<boolean> {
    const s = this;

    s.resetFilters(dataTarget, false);

    const tempFilter = this.filterTerms[dataTarget];
    let success = false;

    if (kendoFilters) {
      const filters = <CompositeFilterDescriptor[]>kendoFilters.filters;

      [].concat.apply([], filters.map(c => c.filters)).forEach(filter => {
        filter.value.forEach(f => {
          const assetFilterTerm = <AssetFilterTermDto>{
            term: <AssetSearchTermDto>{
              dataTarget: dataTarget,
              field: f.field.toString(),
              value: f.value
            },
            operation: f.operator.toString()
          };

          this.filterTerms[dataTarget].push(assetFilterTerm);
          success = true;
        });
      });
    }

    return of(success);
  }

  public getActivityCodes(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getActivityCodes();
  }

  private mapAsset(source: Asset, updated: AssetDto, matchType: ReconciliationMatchType): Asset {
    switch (matchType) {
      case ReconciliationMatchType.parentChildMatch:
        source.isParent = updated.isParent;
        source.parentId = updated.parentId;
        source.isChild = !!updated.parentId && updated.parentId !== updated.id;
        break;
      case ReconciliationMatchType.allocationMatch:
        if (source.dataSource === DataTargetName.inventory) {
          source.historicalCost = updated.historicalCost;
        }
        break;
      default:
        source.isMatched = !!updated.matchId;
        source.matchId = updated.matchId;
        source.matchCodeName = updated.matchCodeName;
        if (source.dataSource === DataTargetName.inventory) {
          source.historicalCost = updated.historicalCost;
        }
    }

    return source;
  }

  private getKeys(obj) {
    const keys = Object.keys(obj).map(key => {
      return { key: key };
    });

    return keys;
  }
}

export interface ReconcileDataGridResult {
  assets: Asset[];
  totalInRecordSet: number;
  allAssetIds: string[];
}
