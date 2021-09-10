import { ReconcileDataService } from './reconcile-data.service';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Asset } from '../../_models/asset.model';
import { ReconciliationMatchService } from '../../_api/services/reconciliation/reconcilation-match.service';
import { ConfigService } from '@ngx-config/core';
import { SelectionChangeEvent } from '../../_models/selection-change-event.model';
import { SetSingleMatchCodeDto } from '../../_api/dtos/set-single-match-code.dto';
import { ReconciliationAllocationDto } from '../../_api/dtos/reconcilation-allocation.dto';
import { SetAllocationMatchCodeDto } from '../../_api/dtos/set-allocation-match.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { ReconciliationSummaryResult } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { ReconcilationMassMatchDto } from '../../_api/dtos/reconcilation-mass-match.dto';
import { ReconciliationMatchDto } from '../../_api/dtos/reconcilation-match.dto';
import { ReconcileMatchItem } from '../../_models/reconcile-match-item.model';

@Injectable()
export class ReconcileMatchService {
  private selectedMatchSource = new BehaviorSubject<Array<Asset>>(new Array<Asset>());
  public selectedMatch$ = this.selectedMatchSource.asObservable();

  constructor(
    private reconcileDataService: ReconcileDataService,
    private reconcileMatchService: ReconciliationMatchService,
    private configService: ConfigService) {}

  updateCurrentMatch(event: SelectionChangeEvent) {
    if (event.itemsAdded.length > 0) {
      const current = this.selectedMatchSource.getValue();

      event.itemsAdded.forEach(selection => {
        if (current.findIndex(d => d.assetId === selection.assetId) < 0) {
          current.push(selection);
        }
      });

      this.selectedMatchSource.next(current);
    }

    if (event.itemsRemoved.length > 0) {
      const current = this.selectedMatchSource.getValue();

      event.itemsRemoved.forEach(selection => {
        const index = current.findIndex(d => d.assetId === selection.assetId);
        if (index >= 0) {
          current.splice(index, 1);
        }
      });

      this.selectedMatchSource.next(current);
    }
  }

  public setCurrentMatch(assets: Asset[]) {
    this.selectedMatchSource.next(assets);
  }

  public clearCurrentMatch() {
    this.selectedMatchSource.next(new Array<Asset>());
  }

  /* end refactor */

  saveSingleMatch(dto: SetSingleMatchCodeDto): Observable<any> {
    return of('id');
  }

  setSingleMatch(recordId: string, matchId: string): Observable<any> {
    return this.reconcileMatchService.setSingleMatch(recordId, matchId);
  }

  createOneToOneMatch(clientRecordId: string, inventoryRecordId: string, matchId: string): Observable<any> {
    const allocation: Array<ReconciliationAllocationDto> = [
      <ReconciliationAllocationDto>{
        assetRecordId: inventoryRecordId,
        allocatedValue: null
      }
    ];

    const dto = new SetAllocationMatchCodeDto(clientRecordId, matchId, allocation);

    return this.reconcileMatchService.createOneToOneMatch(dto);
  }

  createMassSingleMatch(
    selectedAssets: string[], matchCodeId: string): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    const dtoAssets = new Array<ReconcilationMassMatchDto>();

    selectedAssets.forEach(assetId => {
      dtoAssets.push(new ReconcilationMassMatchDto(assetId, '00000000-0000-0000-0000-000000000000', false, matchCodeId));
    });

    return this.reconcileMatchService.setMassMatch(dtoAssets);
  }

  createMassOneToOneMatch(clientAssetIds: string[], inventoryAssetIds: string[], matchCodeId: string): Observable<any> {
    const dtoAssets = new Array<ReconcilationMassMatchDto>();

    for (let i = 0; i < clientAssetIds.length; i++) {
      dtoAssets.push(new ReconcilationMassMatchDto(clientAssetIds[i], inventoryAssetIds[i], true, matchCodeId));
    }
    return this.reconcileMatchService.setMassMatch(dtoAssets);
  }

  setAllocationMatch(clientRecordId: string, allocatedRecords: ReconciliationAllocationDto[], matchId: string): Observable<any> {
    const allocations: Array<ReconciliationAllocationDto> = [];
    for (let i = 0; i < allocatedRecords.length; i++) {
      allocations.push(<ReconciliationAllocationDto>{
        assetRecordId: allocatedRecords[i].assetRecordId,
        allocatedValue: allocatedRecords[i].allocatedValue
      });
    }
    const dto = new SetAllocationMatchCodeDto(clientRecordId, matchId, allocations);
    return this.reconcileMatchService.setAllocationMatch(dto);
  }

  updateAllocationMatch(
    clientRecordId: string,
    allocatedRecords: ReconciliationAllocationDto[], matchCodeId: string, parentAssetId: string, matchId: string): Observable<any> {
    const allocations: Array<ReconciliationAllocationDto> = [];
    for (let i = 0; i < allocatedRecords.length; i++) {
      allocations.push(<ReconciliationAllocationDto>{
        assetRecordId: allocatedRecords[i].assetRecordId,
        allocatedValue: allocatedRecords[i].allocatedValue
      });
    }

    const dto: ReconciliationMatchDto = {
      allocations: allocations,
      assetFileRecordId: clientRecordId,
      matchCodeId: matchCodeId,
      matchId: matchId,
      parentAssetFileRecordId: parentAssetId
    };

    return this.reconcileMatchService.updateAllocationMatch(dto);
  }

  unmatchAssetRecords(inventoryRecordIds: string[]): Observable<any> {
    return this.reconcileMatchService.unmatchAssetRecords(inventoryRecordIds);
  }

  getInventoryMatchRecords(assetFileId: string): Observable<any> {
    return this.reconcileMatchService.getClientMatchRecords(assetFileId);
  }

  getReconciliationMatches(groupId: string): Observable<any> {
    return this.reconcileMatchService.getReconciliationMatches(groupId);
  }

  getReconciliationMatchSummary(groupId: string): Observable<ReconciliationMatchDto[]> {
    return this.reconcileMatchService.getReconciliationMatchSummary(groupId);
  }

  setParentChildMatch(parentAssetId: string, childAssetIds: string[]): Observable<any> {
    return this.reconcileMatchService.setParentChildMatch(parentAssetId, childAssetIds);
  }

  updateMatchCode(matchId: string, matchCodeId: string): Observable<ReconciliationMatchDto> {
    return this.reconcileMatchService.updateMatchCode(matchId, matchCodeId);
  }
  public getMatchRecordsForAsset(assetFileRecordId: string) {
    return this.reconcileMatchService.getMatchRecordsForAsset(assetFileRecordId);
  }

  public getMatchSummaryForAssetIds(groupId: string,
    assetIds: string[]): Observable<ApiServiceResult<ReconciliationSummaryResult>> {
    return this.reconcileMatchService.getMatchSummaryForAssetIds(groupId, assetIds);
  }

  public mapReconcileMatches(dataItems: Array<Asset>, source: number): Array<ReconcileMatchItem> {
    const mapped = new Array<ReconcileMatchItem>();
    dataItems.forEach(item => {
      mapped.push(<ReconcileMatchItem>{ assetId: item.assetId, asset: item, dataSource: source });
    });

    return mapped;
  }

  public editOneToOneMatch(clientRecordId: string, inventoryRecordId: string, matchId: string): any {
    const allocation: Array<ReconciliationAllocationDto> = [
      <ReconciliationAllocationDto>{
        assetRecordId: inventoryRecordId,
        allocatedValue: null
      }
    ];

    const dto = new SetAllocationMatchCodeDto(clientRecordId, matchId, allocation);
    return this.reconcileMatchService.createOneToOneMatch(dto);
  }
}
