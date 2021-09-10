import { Injectable } from '@angular/core';
import { ProcessingService } from '../../services/processing.service';
import { depreciationHeaders } from '../../default-values/default-headers';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { AssetSortTermDto } from '../../../_api/_runtime/dtos/asset-sort-term.dto';
import { TrendingRequestDto } from '../../../_api/_runtime/dtos/trending-request.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { ProcessingSubmissionResponseDto } from '../../../_api/_runtime/dtos/processing-submission-response.dto';
import { ProcessingApiService } from '../../../_api/_runtime/services/processing-api.service';
import { Term, ProcessingDetailRequestDto } from '../../../_api/_runtime/dtos/processing-detail-request.dto';
import { AssetFilterTermDto } from '../../../_api/_runtime/dtos/asset-filter-term.dto';
import { ProcessingDetailResponseDto } from '../../../_api/_runtime/dtos/processing-detail-response.dto';
import { ApiServiceResult } from '../../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../../_api/_configuration/dtos/enum.dto';

@Injectable()
export class TrendingService {
  private successGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());
  private errorGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());

  public successGridData$ = this.successGridDataSource.asObservable();
  public errorGridData$ = this.errorGridDataSource.asObservable();

  public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'id' }];

  private trendingRequestSource = new BehaviorSubject<TrendingRequestDto>(<TrendingRequestDto>{
    sourceField: null,
    destinationField: null,
    rounding: null,
    trendingTableId: '',
    filterTerms: new Array<FilterDto>(),
    filterConjunction: 'and'
  });
  public trendingRequest$ = this.trendingRequestSource.asObservable();

  constructor(private processingApiService: ProcessingApiService,
    private processingService: ProcessingService,
    private referenceDataApiService: ReferenceDataApiService) {}

  public clearTrending() {
    this.successGridDataSource.next(new Array<AssetDto>());
    this.errorGridDataSource.next(new Array<AssetDto>());
  }

  public executeTrending(groupId: string): Observable<ProcessingSubmissionResponseDto> {
    const request = this.trendingRequestSource.getValue();

    const executeRequest = Object.assign({}, request);

    const defaultFilter = [
      <FilterDto>{
        term: <Term>{ dataTarget: this.processingService.dataTarget, field: '', value: '' },
        operation: 'noop'
      }
    ];

    executeRequest.filterTerms = request.filterTerms.length > 0 ? request.filterTerms : defaultFilter;

    return this.processingApiService.executeTrending(groupId, request);
  }

  public updateTrendingResults(
    groupId: string,
    skip: number,
    take: number,
    returnSuccessful: boolean,
    sortTerms: Array<AssetSortTermDto> = new Array<AssetSortTermDto>(),
    filterTerms: Array<AssetFilterTermDto> = new Array<AssetFilterTermDto>()
  ): Observable<ProcessingDetailResponseDto> {
    const defaultFilter = [
      <FilterDto>{
        term: <Term>{ dataTarget: this.processingService.dataTarget, field: '', value: '' },
        operation: 'noop'
      }
    ];

    const request = <ProcessingDetailRequestDto>{
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultSortTerms,
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : defaultFilter,
      filterConjunction: 'and',
      skip: skip,
      take: take,
      recordsRequested: returnSuccessful ? 'SuccessfulRecords' : 'FailedRecords'
    };

    return this.processingApiService.getTrendingResults(groupId, request);
  }

  public commitTrending(groupId: string): Observable<ProcessingSubmissionResponseDto> {
    return this.processingApiService.commitTrending(groupId);
  }

  public setTrendingRequest(dto: TrendingRequestDto): void {
    this.trendingRequestSource.next(dto);
  }

  public addOrUpdateFilter(filterModified: FilterDto): void {
    const currentTrending = this.trendingRequestSource.getValue();
    currentTrending.filterTerms = this.processingService.addOrUpdateFilter(filterModified, currentTrending.filterTerms);
    this.trendingRequestSource.next(currentTrending);
  }

  public removeFilter(id: string): void {
    const currentTrending = this.trendingRequestSource.getValue();
    currentTrending.filterTerms = this.processingService.removeFilter(id, currentTrending.filterTerms);
    this.trendingRequestSource.next(currentTrending);
  }

  public setSuccessGridDataSource(data: Array<AssetDto>): void {
    this.successGridDataSource.next(data);
  }

  public setErrorGridDataSource(data: Array<AssetDto>): void {
    this.errorGridDataSource.next(data);
  }

  public getActivityCodes(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getActivityCodes();
  }
}
