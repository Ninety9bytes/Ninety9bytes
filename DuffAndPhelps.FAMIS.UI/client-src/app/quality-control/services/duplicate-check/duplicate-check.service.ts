import { Injectable } from '@angular/core';
import { QualityControlService } from '../quality-control.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { DuplicateCheckRequestDto } from '../../../_api/_runtime/dtos/duplicate-check.dto';
import { AssetSortTermDto, AssetFilterTermDto, AssetSearchDto } from '../../../_api/dtos/inventory/asset-search.dto';
import { QualityControlApiService } from '../../../_api/_runtime/services/quality-control-api.service';
import { InventoryApiService } from '../../../_api/_runtime/services/inventory-api.service';
import { DuplicateCheckResponseDto } from '../../../_api/_runtime/dtos/duplicate-check-response.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { Term } from '../../../_api/_runtime/dtos/processing-detail-request.dto';
import { AssetSearchResponseDto } from '../../../_api/_runtime/dtos/asset-search-response.dto';

@Injectable()
export class DuplicateCheckService {
  private duplicateCheckRequestSource = new BehaviorSubject<DuplicateCheckRequestDto>(
    <DuplicateCheckRequestDto>{}
  );
  public duplicateCheckRequest$ = this.duplicateCheckRequestSource.asObservable();

  public defaultResultsSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'manufacturer' }];
  public defaultDuplicateCheckSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 1, field: 'count' }];

  constructor(
    private qualityControlApiService: QualityControlApiService,
    private inventoryApiService: InventoryApiService,
    private qualityControlService: QualityControlService
  ) {}

  public updateDuplicateCheckResults(
    groupId: string,
    field: string,
    dataTarget: number,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<AssetSortTermDto>(),
    filterTerms: Array<AssetFilterTermDto> = new Array<AssetFilterTermDto>()
  ): Observable<DuplicateCheckResponseDto> {
    const s = this;

    const current = this.duplicateCheckRequestSource.getValue();

    const defaultFilter = <FilterDto>{
      term: <Term>{ dataTarget: this.qualityControlService.dataTarget, field: '', value: '' },
      operation: 'noop'
    };

    const request = <DuplicateCheckRequestDto>{
      field: field,
      sortTerms: !!sortTerms ? sortTerms : s.defaultDuplicateCheckSortTerms,
      skip: skip,
      take: take,
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : [defaultFilter],
      filterConjunction: 'and'
    };

    return this.qualityControlApiService.duplicateCheck(groupId, request);
  }

  public updateDuplicateSummary(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<AssetSortTermDto>(),
    filterTerms: Array<AssetFilterTermDto> = new Array<AssetFilterTermDto>()
  ): Observable<AssetSearchResponseDto> {
    const defaultFilter = <FilterDto>{
      term: <Term>{ dataTarget: this.qualityControlService.dataTarget, field: '', value: '' },
      operation: 'noop'
    };

    const searchRequest = <AssetSearchDto>{
      fieldMatchTerms: [],
      fieldMatchConjunction: 'and',
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : [defaultFilter],
      filterConjunction: 'and',
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultResultsSortTerms,
      skip: skip,
      take: take
    };

    return this.inventoryApiService.search(groupId, searchRequest);
  }

  public setDuplicateCheckRequest(request: DuplicateCheckRequestDto): void {
    this.duplicateCheckRequestSource.next(request);
  }
}
