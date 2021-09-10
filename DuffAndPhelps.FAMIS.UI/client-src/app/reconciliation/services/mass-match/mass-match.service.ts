import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { SearchRequest } from '../../../_models/search-request.model';
import { FieldMatchDto } from '../../../_api/dtos/inventory/field-match.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { SearchResponseDto } from '../../../_api/dtos/inventory/search-response.dto';
import { FieldMetaDataDto } from '../../../_api/_configuration/dtos/field-metadata.dto';
import { InventorySearchRepository } from '../../../_api/services/inventory/inventory-search-repository.service';
import { ReconciliationMatchService } from '../../../_api/services/reconciliation/reconcilation-match.service';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';
import { ReconcilationMassMatchDto } from '../../../_api/dtos/reconcilation-mass-match.dto';
import { ReconciliationSummaryResult } from '../../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { ApiServiceResult } from '../../../_api/dtos/api-service-result.dto';
import { ReconciliationMatchSummaryDto } from '../../../_api/dtos/reconcilation-match-summary.dto';
import { EnumDto } from '../../../_api/_configuration/dtos/enum.dto';
import { MassMatchGridState } from '../../../_models/mass-match-grid-state';
import { SortTerm } from '../../../_api/_runtime/dtos/sort-term.dto';

@Injectable()
export class MassMatchService {
  private searchRequestSource = new BehaviorSubject<SearchRequest>(<SearchRequest>{
    fieldMatchTerms: new Array<FieldMatchDto>(),
    filterTerms: new Array<FilterDto>(),
    excludeMatchedRecords: true
  });
  private inventoryMetadataSource = new BehaviorSubject<Array<Array<FieldMetaDataDto>>>(new Array<Array<FieldMetaDataDto>>());
  private searchResponseSource = new BehaviorSubject<SearchResponseDto>(null);

  private selectedInventoryHeadersSource = new BehaviorSubject<Array<string>>(new Array<string>());
  private selectedClientHeadersSource = new BehaviorSubject<Array<string>>(new Array<string>());

  public searchRequest$ = this.searchRequestSource.asObservable();
  public searchResponse$ = this.searchResponseSource.asObservable();
  public searchFilterTerms = new Array<FilterDto>();
  public searchFieldMatchTerms = new Array<FieldMatchDto>();

  public selectedInventoryHeaders$ = this.selectedInventoryHeadersSource.asObservable();
  public selectedClientHeaders$ = this.selectedClientHeadersSource.asObservable();

  public inventoryMetadata$ = this.inventoryMetadataSource.asObservable();

  public canMassMatch = false;
  public currentGroupId: string;
  public selectedMatchCode: string;

  constructor(private searchRepository: InventorySearchRepository,
    private reconcileMatchRepository: ReconciliationMatchService,
    private referenceDataApiService: ReferenceDataApiService) {}

  public init(clientAssetCount: number, inventoryAssetCount: number) {
    this.canMassMatch = clientAssetCount > 0 && inventoryAssetCount > 0;
  }

  public saveMassMatch(
    massMatches: ReconcilationMassMatchDto[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    return this.reconcileMatchRepository.setMassMatch(massMatches);
  }

  public updateSearchResponse(response: SearchResponseDto) {
    this.searchResponseSource.next(response);
  }

  public updateInventoryMetadata(inventoryMetadata: Array<Array<FieldMetaDataDto>>): void {
    this.inventoryMetadataSource.next(inventoryMetadata);
  }

  public initSearchResponse(groupId: string) {
    const current = this.searchRequestSource.getValue();
    current.groupId = groupId;
    this.searchRequestSource.next(current);
  }

  public setSelectedMatch(matchCodeId: string) {
    const current = this.searchRequestSource.getValue();
    current.matchCodeId = matchCodeId;
  }

  public addOrUpdateFieldMatch(fieldMatch: FieldMatchDto): void {
    const current = this.searchRequestSource.getValue();
    const index = current.fieldMatchTerms.findIndex(d => d.id === fieldMatch.id);
    if (index === -1) {
      current.fieldMatchTerms.push(fieldMatch);
    } else if (index >= 0) {
      current.fieldMatchTerms[index] = fieldMatch;
    }
    this.searchRequestSource.next(current);
  }

  public addOrUpdateFilter(filter: FilterDto): void {
    const current = this.searchRequestSource.getValue();
    const index = current.filterTerms.findIndex(d => d.id === filter.id);
    if (index === -1) {
      current.filterTerms.push(filter);
    } else if (index >= 0) {
      current.filterTerms[index] = filter;
    }
    this.searchRequestSource.next(current);
  }

  public removeFieldMatch(fieldMatch: FieldMatchDto): void {
    const current = this.searchRequestSource.getValue();
    const index = current.fieldMatchTerms.findIndex(d => d.id === fieldMatch.id);
    if (index >= 0) {
      current.fieldMatchTerms.splice(index, 1);
    }
    this.searchRequestSource.next(current);
  }

  public removeFilter(filter: FilterDto): void {
    const current = this.searchRequestSource.getValue();
    const index = current.filterTerms.findIndex(d => d.id === filter.id);
    if (index >= 0) {
      current.filterTerms.splice(index, 1);
    }
    this.searchRequestSource.next(current);
  }

  public searchAssets(groupId: string, matchCodeId: string,
                      gridState: MassMatchGridState = { skip: 0, take: 250 }): Observable<SearchResponseDto> {
    const currentSearchRequest = this.searchRequestSource.getValue();

    currentSearchRequest.matchCodeId = matchCodeId;
    this.searchFilterTerms = currentSearchRequest.filterTerms;
    this.searchFieldMatchTerms = currentSearchRequest.fieldMatchTerms;

    currentSearchRequest.skip = gridState.skip;
    currentSearchRequest.take = gridState.take;

    const defaultSortTerm = <SortTerm> {
      termOrder: 0,
      field: 'Description',
      sortDirection: 0
    };

    if (gridState.sortTerm) {
      currentSearchRequest.sortTerms = [gridState.sortTerm];
    } else {
      currentSearchRequest.sortTerms = [defaultSortTerm];
    }

    return this.searchRepository.searchAssetsMassMatch(groupId, currentSearchRequest);
  }

  public clearSearch() {
    this.searchRequestSource.next(<SearchRequest>{
      fieldMatchTerms: new Array<FieldMatchDto>(),
      filterTerms: new Array<FilterDto>(),
      excludeMatchedRecords: true
    });
  }

  public getCurrentMatchesForGroup(groupId: string): Observable<ReconciliationMatchSummaryDto[]> {
    return this.reconcileMatchRepository.getReconciliationMatchSummary(groupId);
  }

  public updateSelectedClientHeaders(headers: Array<string>):  void {
    return this.selectedClientHeadersSource.next(headers);
  }

  public updateSelectedInventoryHeaders(headers: Array<string>): void {
    return this.selectedInventoryHeadersSource.next(headers);
  }

  public getActivityCodes(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getActivityCodes();
  }
}
