
import {map, catchError} from 'rxjs/operators';

import { SetSingleMatchCodeDto } from '../../dtos/set-single-match-code.dto';
import { SetAllocationMatchCodeDto } from '../../dtos/set-allocation-match.dto';
import { SetParentChildMatchDto } from '../../dtos/set-parent-child-match.dto';
import { ReconciliationSummaryResult } from '../../dtos/reconciliation/reconciliation-summary-result.dto';
import { ResultType } from '../../../_enums/result-type';
import { ReconciliationMatchDto } from '../../dtos/reconcilation-match.dto';
import { ReconcilationMassMatchDto } from '../../dtos/reconcilation-mass-match.dto';
import { ReconciliationMatchSummaryDto } from '../../dtos/reconcilation-match-summary.dto';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { ReconciliationValidationDto } from '../../dtos/reconciliation/reconciliation-validation-result.dto';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { MatchOrAllocationResult } from '../../dtos/reconciliation/match-or-allocation-result.dto';
import { ReconciliationServiceResultDto } from '../../dtos/reconciliation/reconciliation-service-result.dto';


@Injectable()
export class ReconciliationMatchService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  public setSingleMatch(recordId: string, matchId: string): Observable<any> {
    const dto = new SetSingleMatchCodeDto(recordId, matchId);
    return this.apiService.post(`${this.runtimeEndpoint}/reconciliations/match/single/`, dto);
  }

  public createOneToOneMatch(dto: SetAllocationMatchCodeDto): Observable<any> {
    return this.apiService.post(`${this.runtimeEndpoint}/reconciliations/match/allocation/`, dto);
  }

  public editMatch(dto: ReconciliationMatchDto): Observable<any> {
    return this.apiService.patch(`${this.runtimeEndpoint}/reconciliations/match/allocation/`, dto);
  }

  public setMassMatch(dto: ReconcilationMassMatchDto[]): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    return this.apiService.post(`${this.runtimeEndpoint}/reconciliations/match/massmatch/`, dto);
  }

  public setAllocationMatch(dto: SetAllocationMatchCodeDto): Observable<any> {
    return this.apiService.post(`${this.runtimeEndpoint}/reconciliations/match/allocation/`, dto);
  }

  public updateAllocationMatch(dto: ReconciliationMatchDto): Observable<any> {
    return this.apiService.patch(`${this.runtimeEndpoint}/reconciliations/match/allocation/`, dto);
  }

  public unmatchAssetRecords(inventoryRecordIds: string[]): Observable<ApiServiceResult<MatchOrAllocationResult>> {

    return this.apiService.patch(`${this.runtimeEndpoint}/reconciliations/Assets/MatchAndOrAllocations`, inventoryRecordIds)
    .pipe(map(dto => {
      const serviceResult = <ApiServiceResult<MatchOrAllocationResult>>{
        code: dto.code,
        result: dto.result,
        resultType: ResultType.matchOrAllocationResult
      };

      return serviceResult;
    }));
  }

  public getClientMatchRecords(assetFileId: string): Observable<any> {
    return this.apiService.get(`${this.runtimeEndpoint}/reconciliationmatch/${assetFileId}`);
  }

  public getInventoryMatchRecords(assetFileId: string): Observable<any> {
    return this.apiService.get(`${this.runtimeEndpoint}/reconciliationmatch/${assetFileId}`);
  }

  public getReconciliationMatches(groupId: string): Observable<any> {
    return this.apiService.get(`${this.runtimeEndpoint}/reconciliations/group/${groupId}`).pipe(catchError(err => {
      return [];
    }));
  }

  public getReconciliationMatchSummary(groupId: string): Observable<ReconciliationMatchSummaryDto[]> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/reconciliations/group/${groupId}/summary`).pipe(
      map(res => <ReconciliationMatchSummaryDto[]>res.result))
      .pipe(catchError(err => {
        return [];
      }));
  }

  public deleteGroupReconciliationData(groupId: string): Observable<number> {
    return this.apiService
      .delete(`${this.runtimeEndpoint}/reconciliations/ClearReconciliationDataForGroup/${groupId}`);
  }

  setParentChildMatch(
    parentAssetId: string,
    childAssetIds: string[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    const dto = new SetParentChildMatchDto(parentAssetId, childAssetIds);

    return this.apiService.post(`${this.runtimeEndpoint}/reconciliations/match/parentchild/`, dto)
    .pipe(map(res => {
      const serviceResult = <ApiServiceResult<ReconciliationSummaryResult[]>>{
        code: res.code,
        result: res.result,
        resultType: ResultType.reconciliationSummaryResult
      };

      return serviceResult;
    }));
  }

  updateParentChildMatch(
    parentAssetId: string,
    childAssetIds: string[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    const dto = new SetParentChildMatchDto(parentAssetId, childAssetIds);

    return this.apiService.patch(`${this.runtimeEndpoint}/reconciliations/match/parentchild/`, dto)
    .pipe(map(res => {
      const serviceResult = <ApiServiceResult<ReconciliationSummaryResult[]>>{
        code: res.code,
        result: res.result,
        resultType: ResultType.reconciliationSummaryResult
      };

      return serviceResult;
    }));
  }

  updateMatchCode(matchId: string, matchCodeId: string): Observable<ReconciliationMatchDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/reconciliations/match/${matchId}/matchcode/${matchCodeId}`)
    .pipe(map(r => {
      const serviceResult = <ReconciliationMatchDto>{
        matchId: r.result.matchId,
        matchCodeId: r.result.matchCodeId,
        assetFileRecordId: r.result.assetFileRecordId,
        parentAssetFileRecordId: r.result.parentAssetFileRecordId,
        allocations: r.result.allocations
      };
      return serviceResult;
    }));
  }

  public getMatchRecordsForAsset(assetFileRecordId: string) {
    return this.apiService.get(`${this.runtimeEndpoint}/reconciliationmatch/asset/${assetFileRecordId}`)
    .pipe(catchError(err => {
      return [];
    }));
  }

  public getMatchSummaryForAssetIds(
    groupId: string,
    assetFileRecordIds: string[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult>> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/reconciliations/group/${groupId}/summary`, assetFileRecordIds)
      .pipe(catchError(err => {
        return [];
      }))
      .pipe(map(result => <ApiServiceResult<ReconciliationSummaryResult>>result));
  }

  public validateGroupReconciliation(
    groupId: string,
    includeDetail: boolean
  ): Observable<ReconciliationServiceResultDto<ReconciliationValidationDto>> {
    if (includeDetail) {
      return this.apiService.get(`${this.runtimeEndpoint}/reconciliations/group/${groupId}/validate?includeDetail=true`);
    }
    return this.apiService.get(`${this.runtimeEndpoint}/reconciliations/group/${groupId}/validate`);
  }
}
