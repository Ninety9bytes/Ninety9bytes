
import {map} from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { AlertService } from '../../_core/services/alert.service';
import { Injectable } from '@angular/core';
import { ReconciliationMatchSummaryDto } from '../../_api/dtos/reconcilation-match-summary.dto';
import { Asset } from '../../_models/asset.model';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';
import { FieldOption } from '../../_models/field-option.model';
import { ReconciliationMatchService } from '../../_api/services/reconciliation/reconcilation-match.service';
import { InventoryService } from '../../_api/services/reconciliation/inventory.service';
import { ConfigService } from '@ngx-config/core';
import { ReconciliationSummaryResult, AssetDto } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { ReconciliationMatchType } from '../../_enums/reconciliation-match-type';
import { DataTargetName } from '../../_enums/data-target-name';
import { ParentChildMatchResult } from '../../_models/parent-child-match-result.model';
import { ReconciliationMatchDto } from '../../_api/dtos/reconcilation-match.dto';
import { ReconciliationValidationDto } from '../../_api/dtos/reconciliation/reconciliation-validation-result.dto';

@Injectable()
export class ReconcileDataService {
  private matchedRecordsSource = new BehaviorSubject<Array<ReconciliationMatchSummaryDto>>(
    new Array<ReconciliationMatchSummaryDto>()
  );
  private clientFileAssetsSource = new BehaviorSubject<Array<Asset>>(null);
  private inventoryAssetsSource = new BehaviorSubject<Array<Asset>>(null);

  public groupId: string;

  private groupSiteInfoSource = new BehaviorSubject<Array<CascadedSelectOption>>(new Array<CascadedSelectOption>());
  public groupSiteInfo$ = this.groupSiteInfoSource.asObservable();
  public groupSiteInfo: CascadedSelectOption[];

  private groupDepartmentInfoSource = new BehaviorSubject<Array<FieldOption>>(new Array<FieldOption>());
  public groupDepartmentInfo$ = this.groupDepartmentInfoSource.asObservable();
  public groupDepartmentInfo: FieldOption[];

  private groupAccountInfoSource = new BehaviorSubject<Array<FieldOption>>(new Array<FieldOption>());
  public groupAccountInfo$ = this.groupAccountInfoSource.asObservable();
  public groupAccountInfo: FieldOption[];

  public matchedRecords$ = this.matchedRecordsSource.asObservable();
  public clientFileAssets$ = this.clientFileAssetsSource.asObservable();
  public inventoryAssets$ = this.inventoryAssetsSource.asObservable();

  public defaultColumns = ['assetTagNumber', 'oldTagNumber', 'description'];

  constructor(
    private reconcileMatchApiService: ReconciliationMatchService,
  ) {}

  public getMatchType(match: ReconciliationSummaryResult): ReconciliationMatchType {
    let matchType = ReconciliationMatchType.singleMatch;

    if (match.assetData.filter(c => c.allocationId !== null).length > 2) {
      matchType = ReconciliationMatchType.allocationMatch;
    }

    if (match.assetData.filter(c => c.allocationId !== null).length === 2) {
      matchType = ReconciliationMatchType.oneToOneMatch;
    }

    return matchType;
  }

  private updateMatchedRecords() {
    this.reconcileMatchApiService.getReconciliationMatchSummary(this.groupId).subscribe(matches => {
      this.matchedRecordsSource.next(matches);
    });
  }

  public updateClientFile(assets: Asset[]) {
    assets.forEach(asset => {
      var current = this.clientFileAssetsSource.getValue();
      if(current){
        var index = current.findIndex(d => d.assetId == asset.assetId);
        if (index >= 0) {
          current[index] == asset;
        }
        this.clientFileAssetsSource.next(current);
      }
      this.updateMatchedRecords();
    });
  }

  public updateInventory(assets: Asset[]) {
    assets.forEach(asset => {
      var current = this.inventoryAssetsSource.getValue();
      if(current){
        var index = current.findIndex(d => d.assetId == asset.assetId);
        if (index >= 0) {
          current[index] == asset;
        }
        this.inventoryAssetsSource.next(current);
      }
      this.updateMatchedRecords();
    });
  }

  public updateInventoryAsset(updatedAsset: Asset) {
    var currentInventory = this.inventoryAssetsSource.getValue();
    var index = currentInventory.findIndex(d => d.assetId == updatedAsset.assetId);
    if (index != -1) {
      var currentAsset = currentInventory[index];

      for (let [key, value] of Object.entries(updatedAsset)) {
        currentAsset[key] = value;
      }

      currentInventory[index] = currentAsset;
      this.inventoryAssetsSource.next(currentInventory);
    }
  }

  public updateClientAsset(updatedAsset: Asset) {
    var currentClientAssets = this.clientFileAssetsSource.getValue();
    var index = currentClientAssets.findIndex(d => d.assetId == updatedAsset.assetId);
    if (index != -1) {
      var currentAsset = currentClientAssets[index];

      for (let [key, value] of Object.entries(updatedAsset)) {
        currentAsset[key] = value;
      }

      currentClientAssets[index] = currentAsset;
      this.clientFileAssetsSource.next(currentClientAssets);
    }
  }

  public addCreatedInventoryAsset(asset: Asset) {
    asset.dataSource = DataTargetName.inventory;
    var inventoryAssets = this.inventoryAssetsSource.getValue();

    asset.parentChildMatches = new Array<Asset>();
    asset.isMatched = false;
    asset.isParent = false;
    asset.isChild = false;
    asset.parentId = '';

    inventoryAssets.push(asset);
    this.inventoryAssetsSource.next(inventoryAssets);
  }

  public updateParentChildMatch(result: ParentChildMatchResult) {
    if (result.entities.length === 0) return;

    let assetIds = new Array<string>();
    assetIds.push(result.entities[0].parentAssetFileRecordId);
    result.entities.forEach(e => assetIds.push(e.assetFileRecordId));
  }

  public getKeys(obj) {
    let keys = Object.keys(obj).map(key => {
      return { key: key };
    });

    return keys;
  }

  //	Creates an array of Assets with dynamic custom properties
  public mapAsset(assetDto: AssetDto, dataSource: number): Asset {
    let asset = <Asset>{ assetId: assetDto.id };

    let keys = this.getKeys(assetDto);

    asset.dataSource = dataSource;
    asset.isChild = assetDto.parentId && assetDto.isParent === false;

    for (let [key, value] of Object.entries(assetDto)) {
      asset[key] = value;
    }

    return asset;
  }

  public updateGroupSiteInfo(groupSiteInfo: Array<CascadedSelectOption>){
    this.groupSiteInfoSource.next(groupSiteInfo);
  }

  public updateGroupDepartmentInfo(groupDepartmentsInfo: Array<FieldOption>){
    this.groupDepartmentInfoSource.next(groupDepartmentsInfo);
  }

  public updateGroupAccountInfo(groupAccountsInfo: Array<FieldOption>){
    this.groupAccountInfoSource.next(groupAccountsInfo);
  }

  //	Maps match data to Assets
  private initMatches(inventory: Array<Asset>, clientFile: Array<Asset>, dataSource: number): Array<Asset> {
    let assets = dataSource === DataTargetName.client ? clientFile : inventory;

    let matchedRecords = this.matchedRecordsSource.getValue();

    assets.forEach(a => {
      let asset = a;

      asset.parentChildMatches = new Array<Asset>();

      asset.isMatched = false;
      asset.isParent = false;
      asset.isChild = false;
      asset.parentId = '';

      let currentMatch = this.findMatchForAsset(asset.assetId);

      if (currentMatch) {
        let matchesForAsset = this.findMatchesForMatchId(currentMatch.matchId);

        // if match is parent -> map child records
        if (currentMatch.parent) {
          asset.isParent = true;
          matchedRecords.filter(c => c.parentAssetFileRecordId === currentMatch.assetId && !c.parent).forEach(child => {
            let clientFileDataItem = clientFile.find(c => c.assetId == child.assetId);

            if (clientFileDataItem) {
              asset.parentChildMatches.push(clientFileDataItem);
            }
          });
        }

        if (currentMatch.matchId) {
          asset.isMatched = true;

          if (!currentMatch.parent && currentMatch.parentAssetFileRecordId && currentMatch.parentAssetFileRecordId.length > 0) {
            asset.isChild = true;
            asset.parentId = currentMatch.parentAssetFileRecordId;
            asset.matchType = ReconciliationMatchType.parentChildMatch;
          }

          if (matchesForAsset.length === 1) {
            asset.matchType = ReconciliationMatchType.singleMatch;
          }

          if (matchesForAsset.length > 2 && matchesForAsset.some(c => c.allocationId != null)) {
            asset.matchType = ReconciliationMatchType.allocationMatch;
          }

          if (matchesForAsset.length === 2 && matchesForAsset.some(c => c.allocationId != null)) {
            asset.matchType = ReconciliationMatchType.oneToOneMatch;
          }
        }

        asset.matchId = currentMatch.matchId;
        asset.matchCodeId = currentMatch.matchCodeId;
        asset.allocatedValue = currentMatch.allocatedValue;
        asset.allocationId = currentMatch.allocationId;
      }
    });

    return assets;
  }

  private findMatchesForMatchId(matchId: string) {
    let current = this.matchedRecordsSource.getValue();

    return current.filter(c => c.matchId === matchId);
  }

  private findMatchForAsset(assetId: string): ReconciliationMatchSummaryDto {
    let current = this.matchedRecordsSource.getValue();

    return current.find(c => c.assetId === assetId);
  }

  private determineMatchType(match: ReconciliationMatchSummaryDto): ReconciliationMatchType {
    // Check if this match is a child.
    if (match.parentAssetFileRecordId && match.parentAssetFileRecordId.length > 0 && match.parentAssetFileRecordId !== match.assetId) {
      return ReconciliationMatchType.parentChildMatch;
    }

    let matches = this.matchedRecordsSource.getValue();
    let matchCount = matches.filter(m => m.matchId == match.matchId).length;

    /// how many
    if (matchCount == 0)
      // This means we are probably a parent
      return null;
    if (matchCount == 1) return ReconciliationMatchType.singleMatch;
    if (matchCount == 2) return ReconciliationMatchType.oneToOneMatch;

    return ReconciliationMatchType.allocationMatch;
  }

  private determineIfParent(match: ReconciliationMatchSummaryDto): boolean {
    if (match.parent === true) return true;

    let matchesSource = this.matchedRecordsSource.getValue();
    let children = matchesSource.filter(m => m.parentAssetFileRecordId === match.assetId && m.assetId !== match.assetId);
    return children.length > 0;
  }

  private determineIfChild(match: ReconciliationMatchSummaryDto): boolean {
    return match.parentAssetFileRecordId != null && match.assetId !== match.parentAssetFileRecordId;
  }

  private applyReconciliationMatch(asset: Asset, match: ReconciliationMatchDto): Asset {
    asset.isMatched = true;
    asset.matchId = match.matchId;
    //asset.matchType = this.determineMatchType(match);
    asset.matchCodeId = match.matchCodeId;
    asset.parentId = match.parentAssetFileRecordId;

    if (match.allocations == null || match.allocations.length == 0) return asset;

    let inventoryRecords = this.inventoryAssetsSource.getValue();
    match.allocations.forEach(a => {
      let inventoryAsset = inventoryRecords.find(i => i.assetId == a.assetRecordId);
      inventoryAsset.isMatched = true;
      inventoryAsset.matchId = match.matchId;
      //inventoryAsset.matchType = this.determineMatchType(match);
      inventoryAsset.matchCodeId = match.matchCodeId;
      inventoryAsset.parentId = match.parentAssetFileRecordId;
    });
  }

  private isClientAsset(assetId: string): boolean {
    var clientAssets = this.clientFileAssetsSource.getValue();
    return clientAssets.findIndex(asset => asset.assetId == assetId) != -1;
  }

  private updateMatchRecords(matches: ReconciliationMatchSummaryDto[]) {
    let matchSource = this.matchedRecordsSource.getValue();
    matches.forEach(match => {
      let index = matchSource.findIndex(m => m.assetId == match.assetId);
      if (index != -1) {
        matchSource.splice(index, 1);
      }
      match.parent = match.parentAssetFileRecordId
        ? match.parentAssetFileRecordId == match.assetId
        : matchSource.findIndex(m => m.parentAssetFileRecordId == match.assetId) > 0;
      matchSource.push(match);
    });
    this.matchedRecordsSource.next(matchSource);
  }

  public applyMatchSummaryToAsset(match: ReconciliationMatchSummaryDto) {
    if (this.isClientAsset(match.assetId)) this.refreshClientMatchData(match.assetId);
    else this.refreshInventoryMatchData(match.assetId);
  }

  private clearMatchData(assets: Asset[], assetIndex: number) {
    assets[assetIndex].isMatched = false;
    assets[assetIndex].isParent = false;
    assets[assetIndex].isChild = false;
    delete assets[assetIndex].parentId;
    assets[assetIndex].matchType = null;
    delete assets[assetIndex].matchId;
    delete assets[assetIndex].matchCodeId;
    delete assets[assetIndex].allocatedValue;
    delete assets[assetIndex].allocationId;
  }

  private applyMatchData(assets: Asset[], assetIndex: number, matchIndex: number) {
    if (matchIndex == -1) {
      this.clearMatchData(assets, assetIndex);
      return;
    }

    let matches = this.matchedRecordsSource.getValue();
    let match = matches[matchIndex];

    assets[assetIndex].isMatched = match.matchId != null && match.matchId.length > 0;
    assets[assetIndex].isParent = this.determineIfParent(match);
    assets[assetIndex].isChild = this.determineIfChild(match);
    if (match.parentAssetFileRecordId != null) assets[assetIndex].parentId = match.parentAssetFileRecordId;
    else delete assets[assetIndex].parentId;
    assets[assetIndex].matchType = this.determineMatchType(match);
    if (match.matchId != null) assets[assetIndex].matchId = match.matchId;
    else delete assets[assetIndex].matchId;
    assets[assetIndex].matchCodeId = match.matchCodeId != null ? match.matchCodeId : '';
    assets[assetIndex].allocatedValue = match.allocatedValue;
    assets[assetIndex].allocationId = match.allocationId;
    assets[assetIndex].parentChildMatches = [];
    if (match.parent === true) {
      let matchRecords = this.matchedRecordsSource.getValue();
      let children = matchRecords.filter(m => m.parentAssetFileRecordId === match.assetId && m.assetId != match.assetId);
      children.forEach(child => assets[assetIndex].parentChildMatches.push(assets.find(a => a.assetId == child.assetId)));
    }
  }

  private refreshInventoryMatchData(assetId: string) {
    let assets = this.inventoryAssetsSource.getValue();
    let matches = this.matchedRecordsSource.getValue();
    let assetIndex = assets.findIndex(asset => asset.assetId == assetId);
    if (assetIndex == -1) {
      console.error('refreshInventoryMatchData failed because of unknown assetId');
      return;
    }
    let matchIndex = matches.findIndex(match => match.assetId == assetId);
    this.applyMatchData(assets, assetIndex, matchIndex);
    this.inventoryAssetsSource.next(assets);
  }

  private refreshClientMatchData(assetId: string): Observable<boolean> {
    let assets = this.clientFileAssetsSource.getValue();
    let matches = this.matchedRecordsSource.getValue();
    let assetIndex = assets.findIndex(asset => asset.assetId == assetId);
    if (assetIndex == -1) {
      console.error('refreshInventoryMatchData failed because of unknown assetId');
      return;
    }
    let matchIndex = matches.findIndex(match => match.assetId == assetId);
    this.applyMatchData(assets, assetIndex, matchIndex);
    this.clientFileAssetsSource.next(assets);
  }

  public saveReconciliationMatchDto(matches: ReconciliationMatchDto[]) {
    let ids: Array<string> = [];
    matches.forEach(match => {
      ids.push(match.assetFileRecordId);
      if (match.allocations != null) match.allocations.forEach(a => ids.push(a.assetRecordId));
    });
  }

  public validateReconciliation(includeDetail: boolean): Observable<ReconciliationValidationDto> {
    return this.reconcileMatchApiService.validateGroupReconciliation(this.groupId, includeDetail).pipe(map(result => result.result));
  }
}
