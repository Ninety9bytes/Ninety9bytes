import { Injectable } from '@angular/core';
import { ProcessingService } from '../../services/processing.service';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { AssetSortTermDto, AssetFilterTermDto } from '../../../_api/dtos/inventory/asset-search.dto';
import { DepreciationSubmissionRequestDto } from '../../../_api/_runtime/dtos/depreciation-request.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { ProcessingApiService } from '../../../_api/_runtime/services/processing-api.service';
import { ProcessingExecutionResult } from '../../../_api/_runtime/dtos/processing-execution-result.dto';
import { ProcessingDetailResponseDto } from '../../../_api/_runtime/dtos/processing-detail-response.dto';
import { Term, ProcessingDetailRequestDto } from '../../../_api/_runtime/dtos/processing-detail-request.dto';
import { ProcessingSubmissionResponseDto } from '../../../_api/_runtime/dtos/processing-submission-response.dto';
import { ApiServiceResult } from '../../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../../_api/_configuration/dtos/enum.dto';

@Injectable()
export class DepreciationService {
  private successGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());
  private errorGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());
  public successGridData$ = this.successGridDataSource.asObservable();
  public errorGridData$ = this.errorGridDataSource.asObservable();
  public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'id' }];

  termOrder: number;
  sortDirection: number;
  field: string;

  private depreciationRequestSource = new BehaviorSubject<DepreciationSubmissionRequestDto>(
    <DepreciationSubmissionRequestDto>{
      method: 0,
      convention: 0,
      dayOneCalc: false,
      futureYears: 0,
      filterTerms: new Array<FilterDto>()
    }
  );

  public depreciationRequest$ = this.depreciationRequestSource.asObservable();

  public clearDepreciation() {
    this.successGridDataSource.next(new Array<AssetDto>());
    this.errorGridDataSource.next(new Array<AssetDto>());
  }

  constructor(private processingApiService: ProcessingApiService,
              private processingService: ProcessingService,
              private referenceDataApiService: ReferenceDataApiService) {}

  public executeDepreciation(groupId: string): Observable<ProcessingExecutionResult> {
    const request = this.depreciationRequestSource.getValue();

    const defaultFilter = <FilterDto>{
      term: <Term>{ dataTarget: this.processingService.dataTarget, field: '', value: '' },
      operation: 'noop'
    };

    const executeRequest = Object.assign({}, request);

    executeRequest.filterTerms = request.filterTerms.length > 0 ? request.filterTerms : [defaultFilter];

    return this.processingApiService.executeDepreciation(groupId, executeRequest);
  }

  public updateDepreciationResults(
    groupId: string,
    skip: number,
    take: number,
    returnSuccessful: boolean,
    sortTerms: Array<AssetSortTermDto> = new Array<AssetSortTermDto>(),
    filterTerms: Array<AssetFilterTermDto> = new Array<AssetFilterTermDto>()
  ): Observable<ProcessingDetailResponseDto> {
    this.depreciationRequestSource.getValue();

    const defaultFilter = <FilterDto>{
      term: <Term> { dataTarget: this.processingService.dataTarget, field: '', value: '' },
      operation: 'noop'
    };

    const request = <ProcessingDetailRequestDto>{
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultSortTerms,
      skip: skip,
      take: take,
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : [defaultFilter],
      filterConjunction: 'and',
      recordsRequested: returnSuccessful ? 'SuccessfulRecords' : 'FailedRecords'
    };

    return this.processingApiService.getDepreciationResults(groupId, request);
  }

  public commitDepreciation(groupId: string): Observable<ProcessingSubmissionResponseDto> {
    return this.processingApiService.commitDepreciation(groupId);
  }
  /* End Depreciation Actions */

  // Updates the request in progress
  public setDepreciationRequest(dto: DepreciationSubmissionRequestDto): void {
    const current = this.depreciationRequestSource.getValue();

    current.convention = dto.convention;
    current.dayOneCalc = dto.dayOneCalc;
    current.futureYears = dto.futureYears;
    current.method = dto.method;
    this.depreciationRequestSource.next(current);
  }
  // Updates the filter on the request in progress
  public addOrUpdateFilter(filterModified: FilterDto): void {
    const currentDepreciation = this.depreciationRequestSource.getValue();
    currentDepreciation.filterTerms = this.processingService.addOrUpdateFilter(filterModified, currentDepreciation.filterTerms);
    this.depreciationRequestSource.next(currentDepreciation);
  }

  // Removes filter from the request in progress
  public removeFilter(id: string): void {
    const currentDepreciation = this.depreciationRequestSource.getValue();
    currentDepreciation.filterTerms = this.processingService.removeFilter(id, currentDepreciation.filterTerms);
    this.depreciationRequestSource.next(currentDepreciation);
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
