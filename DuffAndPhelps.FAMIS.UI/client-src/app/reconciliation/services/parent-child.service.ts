
import {map} from 'rxjs/operators';
import { ReconcileMatchService } from './reconcile-match.service';
import { ReconcileDataService } from './reconcile-data.service';
import { ReconcileParentChild } from '../../_models/reconcile-parent-child.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Asset } from '../../_models/asset.model';
import { ReconciliationMatchService } from '../../_api/services/reconciliation/reconcilation-match.service';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { ReconciliationSummaryResult } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { MatchOrAllocationResult } from '../../_api/dtos/reconciliation/match-or-allocation-result.dto';
import { ParentChildMatchEntity } from '../../_models/parent-child-match-result.model';

@Injectable()
export class ParentChildService {
  private selectedAssets = new BehaviorSubject<Array<ReconcileParentChild>>(new Array<ReconcileParentChild>());
  public currentSelectedAssets = this.selectedAssets.asObservable();

  private childrenSource = new BehaviorSubject<Array<Asset>>(new Array<Asset>());
  public children$ = this.childrenSource.asObservable();

  private validationErrors: string[];

  constructor(
    private reconciliationMatchService: ReconciliationMatchService,
    private reconcileMatchService: ReconcileMatchService,
    private reconcileDataService: ReconcileDataService
  ) {}

  changeSelectedAssets(updatedSelection: Array<any>, isAdded: boolean) {
    updatedSelection.forEach(row => {
      const model = this.mapAssetToParentChild(row);
      if (isAdded) {
        this.addSelectedAsset(model);
      } else {
        this.removeSelectedAsset(model);
      }
    });
  }

  setSelectedAssets(assets: Array<Asset>) {
    this.clearSelectedAssets();

    assets.forEach(asset => {
      const model = this.mapAssetToParentChild(asset);
      this.addSelectedAsset(model);
    });
  }

  clearSelectedAssets() {
    this.selectedAssets.next(new Array<ReconcileParentChild>());
  }

  private mapAssetToParentChild(asset: Asset): ReconcileParentChild {
    if (asset == null) { return null; }
    const result: ReconcileParentChild = {
      assetId: asset.assetId,
      isParent: asset.isParent, // TODO
      parentId: asset.parentId, // TODO
      assetTagNumber: asset.assetTagNumber,
      oldTagNumber: asset.oldTagNumber,
      description: asset.description,
      serialNumber: asset.serialNumber,
      historicalCost: asset.historicalCost
    };
    return result;
  }

  private addSelectedAsset(selection: ReconcileParentChild) {
    const current = this.selectedAssets.getValue();
    if (current.findIndex(d => d.assetId === selection.assetId) < 0) {
      current.push(selection);
    }
    this.selectedAssets.next(current);
  }

  private removeSelectedAsset(selection: ReconcileParentChild) {
    const current = this.selectedAssets.getValue();
    const index = current.findIndex(d => d.assetId === selection.assetId);
    if (index >= 0) {
      current.splice(index, 1);
    }
    this.selectedAssets.next(current);
  }

  public isValidSelection(assets: Array<ReconcileParentChild>): Observable<boolean> {
    const assetIds = assets.map(({ assetId }) => assetId);
    const groupId = this.reconcileDataService.groupId;

    this.validationErrors = [];

    const isValid = this.reconciliationMatchService.getMatchSummaryForAssetIds(groupId, assetIds).pipe(map(({ result }) => {
      if (result == null) {
        this.validationErrors.push('Unknown service error.');
        return false;
      }

      if (result.assetData.filter(c => c.isParent).length > 1) {
        this.validationErrors.push('Matches from more than one parent/child relationship are not allowed.');
        return false;
      }

      return true;
    }));

    return isValid;
  }

  public getValidationErrors(): string {
    return this.validationErrors.join('<br>');
  }

  public getMatchSummaryForAssetIds(assetIds: string[]): Observable<ApiServiceResult<ReconciliationSummaryResult>> {
    const groupId = this.reconcileDataService.groupId;
    return this.reconciliationMatchService.getMatchSummaryForAssetIds(groupId, assetIds);
  }

  public setParentChildMatches(
    parentId: string,
    assetIds: string[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    return this.reconciliationMatchService.setParentChildMatch(parentId, assetIds);
  }

  public updateParentChildMatches(
    parentId: string,
    assetIds: string[]
  ): Observable<ApiServiceResult<ReconciliationSummaryResult[]>> {
    return this.reconciliationMatchService.updateParentChildMatch(parentId, assetIds);
  }

  public removeChildMatches(assetIds: string[]): Observable<ApiServiceResult<MatchOrAllocationResult>> {
    return this.reconciliationMatchService.unmatchAssetRecords(assetIds);
  }

  public setChildren(children: Array<Asset>) {
    this.childrenSource.next(children);
  }

  public clearChildren() {
    this.childrenSource.next(new Array<Asset>());
  }

  private mapResultToEntity(result: any): ParentChildMatchEntity[] {
    const entities = new Array<ParentChildMatchEntity>();

    result.forEach(r => {
      const entity = <ParentChildMatchEntity>{
        assetFileRecordId: r.assetFileRecordId,
        matchCodeId: r.matchCodeId,
        matchId: r.matchId,
        parentAssetFileRecordId: r.parentAssetFileRecordId
      };

      entities.push(entity);
    });

    return entities;
  }
}
