import { AlertService } from '../../_core/services/alert.service';
import { ReconciliationInventoryService } from '../services/inventory.service';
import { ReconcileMatchService } from '../services/reconcile-match.service';
import { AllocationService } from '../services/allocation.service';
import { ParentChildService } from '../services/parent-child.service';
import { ReconcileDataService } from '../services/reconcile-data.service';

import { ParentChildMatchComponent } from './parent-child-match.component';
import { ReconcileDataAllocationsComponent } from './reconcile-data-allocations.component';
import { ReconcileDataGridComponent } from './reconcile-data-grid.component';
import { OrderAssetColumnsComponent } from './order-asset-columns-component';
import { MassMatchService } from '../services/mass-match/mass-match.service';
import { ReconciliationValidationComponent } from './reconciliation-validation.component';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ReconcileDataGridService } from '../services/reconcile-data-grid.service';
import { BuildingInfoService } from '../../_core/services/building-info-service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { NgForm } from '@angular/forms';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { fadeInOutAnimation } from '../../_core/animations/fade-in-out.animation';
import { ReconciliationMatchType } from '../../_enums/reconciliation-match-type';
import { DataTargetName } from '../../_enums/data-target-name';
import { Asset } from '../../_models/asset.model';
import { GroupMatchCode } from '../../_models/group-match-code.model';
import { MatchCodesService } from '../../_api/services/reconciliation/match-codes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectionChangeEvent } from '../../_models/selection-change-event.model';
import { ModalProperties } from '../../_models/modal-properties.model';
import { MatchSelectionEvent } from '../../_models/match-selection-event.model';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { ReconciliationSummaryResult, AssetDto } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';

enum AssetFileType {
  ClientFile,
  ActualInventory
}

@Component({
  selector: 'reconcile-data',
  templateUrl: './reconcile-data.component.html',
  animations: [fadeInOutAnimation]
})
export class ReconcileDataComponent extends ComponentCanDeactivate implements OnInit, TranslatedComponent, AfterViewInit {


  i18n = TranslationBaseKeys;
  // Show/hide Asset Ids for debugging
  public isDebugMode = true;

  public matchTypes = ReconciliationMatchType;
  public selectedMatchType: number;
  public dataTargetName = DataTargetName;

  public selectedClientFileItems: Array<Asset> = new Array<Asset>();
  public selectedInventoryItems: Array<Asset> = new Array<Asset>();

  selectedInventoryIds: Array<string> = new Array<string>();
  selectedClientFileIds: Array<string> = new Array<string>();
  public hasSelectedItems: boolean;
  public showValidationErrors: boolean;

  public selectedMatchCodeId = '';

  public matchCodes: any;
  public disabledMatchCodes: Array<GroupMatchCode>;

  public selectedGroupId: string;

  public canMassMatch = false;
  public inventoryFileCount = 0;
  public clientFileCount = 0;

  public currentChildren = new Array<Asset>();

  public isBusy = false;
  public isMatchSummaryExpanded = false;

  clientFileGridBusy: boolean;
  inventoryGridBusy: boolean;

  @ViewChild(ParentChildMatchComponent, {static: false}) parentChildMatchComponent: ParentChildMatchComponent;

  @ViewChild(ReconcileDataAllocationsComponent, {static: false}) reconcileDataAllocationsComponent: ReconcileDataAllocationsComponent;

  @ViewChild('clientFileGrid', {static: false}) private clientFileGrid: ReconcileDataGridComponent;
  @ViewChild('inventoryGrid', {static: false}) private inventoryGrid: ReconcileDataGridComponent;
  @ViewChild(OrderAssetColumnsComponent, {static: false}) orderClientAssetColumns: OrderAssetColumnsComponent;
  @ViewChild(OrderAssetColumnsComponent, {static: false}) orderInventoryAssetColumns: OrderAssetColumnsComponent;
  @ViewChild(ReconciliationValidationComponent, { static: false}) reconciliationValidationComponent: ReconciliationValidationComponent;
  @ViewChild('acceptMatchForm', {static: false}) private acceptMatchForm: NgForm;

  constructor(
    private reconcileDataService: ReconcileDataService,
    private reconcileMatchService: ReconcileMatchService,
    private inventoryService: ReconciliationInventoryService,
    private matchCodesService: MatchCodesService,
    private route: ActivatedRoute,
    private router: Router,
    private allocationService: AllocationService,
    private alertService: AlertService,
    private parentChildService: ParentChildService,
    private massMatchService: MassMatchService,
    private reconcileGridService: ReconcileDataGridService,
    private buildingInfoService: BuildingInfoService,
    private modalService: NgbModal,
    private canDeactivateService: CanDeactivateService
  ) { super(); }

  ngOnInit() {
    this.selectedGroupId = this.reconcileDataService.groupId;

    this.reconcileDataService.validateReconciliation(false).subscribe(result => {
      if (result.isReconciliationComplete) {
        this.showValidationErrors = false;
      } else {
        this.showValidationErrors = true;
      }
    });

    this.clientFileGridBusy = true;
    this.inventoryGridBusy = true;

    this.reconcileGridService.clearCachedRecords();
    this.reconcileGridService.clearRecordCounts();
    this.reconcileMatchService.clearCurrentMatch();
    this.reconcileGridService.clearHeaders();
    this.reconcileGridService.clearSelectedHeaders();
    this.reconcileGridService.resetFilters(null, true);

    this.reconcileMatchService.selectedMatch$.subscribe(matchedItems => {
      this.selectedClientFileItems = matchedItems.filter(c => c.dataSource === DataTargetName.client);
      this.selectedInventoryItems = matchedItems.filter(c => c.dataSource === DataTargetName.inventory);

      this.selectedClientFileIds = this.selectedClientFileItems.map(c => c.assetId);
      this.selectedInventoryIds = this.selectedInventoryItems.map(c => c.assetId);
    });

    this.allocationService.clearSelections();

    this.matchCodesService.getGroupMatchCodes(this.selectedGroupId).subscribe(result => {
      this.matchCodes = new Array<GroupMatchCode>();
      this.disabledMatchCodes = new Array<GroupMatchCode>();
      result.forEach(code => {
        if (code.groupMatchCodeIsEnabled && code.matchCodeIsEnabled) {
          this.matchCodes.push(code);
        }
        if (code.groupMatchCodeIsEnabled && !code.matchCodeIsEnabled) {
          this.disabledMatchCodes.push(code);
        }
      });
    });

    this.reconcileGridService.recordCounts$.subscribe(counts => {
      this.clientFileCount = counts[DataTargetName.client];
      this.inventoryFileCount = counts[DataTargetName.inventory];

      this.massMatchService.init(this.clientFileCount, this.inventoryFileCount);
      this.canMassMatch = this.massMatchService.canMassMatch;
    });

    this.parentChildService.children$.subscribe(currentChildren => {
      this.currentChildren = currentChildren;
    });

    this.buildingInfoService.getBuildingHierarchyByGroupId(this.selectedGroupId).subscribe(hierachy => {
      this.reconcileDataService.updateGroupSiteInfo(this.buildingInfoService.mapSitesToSelectOptions(hierachy));
    });

    this.inventoryService.getGroupAccountOptions(this.selectedGroupId).subscribe(accountOptions => {
      this.reconcileDataService.updateGroupAccountInfo(accountOptions);
    });

    this.inventoryService.getGroupDepartmentsOptions(this.selectedGroupId).subscribe(departmentOptions => {
      this.reconcileDataService.updateGroupDepartmentInfo(departmentOptions);
    });
  }

  ngAfterViewInit(): void {
    this.reconciliationValidationComponent.noLongerBusy.subscribe((result) => {
      console.log(result);
      if (result) {
        this.isBusy = false;
      }
    });
  }

  onSubmit(form: any) {
    if (form.valid) {

      let isEditingMatch = false;

      let selectedMatchIds = new Array<string>();

      selectedMatchIds = this.selectedClientFileItems.map(c => c.matchId).concat(this.selectedInventoryItems.map(c => c.matchId));

      if (selectedMatchIds.length > 0) {
        // Checking selected match ids if all the same then a one to one match is selected for editing
        isEditingMatch = !!selectedMatchIds.every(c => !!c && c === selectedMatchIds[0]);
      }

      // console.log(isEditingMatch);

      if (!isEditingMatch) {
        const numSelectedClient = this.selectedClientFileItems.length;
        const numSelectedInventory = this.selectedInventoryItems.length;

        // Can't Create a match if the slected items are already matched
        let isValidSelection = true;
        this.selectedClientFileItems.forEach(asset => {
          if (asset.isMatched) {
            isValidSelection = false;
            return;
          }
        });
        this.selectedInventoryItems.forEach(asset => {
          if (asset.isMatched) {
            isValidSelection = false;
            return;
          }
        });
        if (!isValidSelection) {
          this.alertService.error('Cannot match current asset selection.');
          return;
        }

       if (numSelectedClient === 0 && numSelectedInventory > 0) {
          // One item (only) selected in inventory file; save single match
          // console.log('Saving Single Inventory Match');
          this.saveSingleMatches(form, this.selectedInventoryItems.map(c => c.assetId), this.selectedMatchCodeId);
        } else if (numSelectedInventory === 0 && numSelectedClient > 0) {
          // One item (only) selected in client file; save single match
          // console.log('Saving Single Client Match');
          this.saveSingleMatches(form, this.selectedClientFileItems.map(c => c.assetId), this.selectedMatchCodeId);
        } else if (numSelectedClient === numSelectedInventory) {
          // Equal number of items selected in both lists; save simple matches
          // console.log('Saving Simple Match(es)');
          this.saveOneToOneMatches(
            form,
            this.selectedClientFileItems.map(c => c.assetId),
            this.selectedInventoryItems.map(c => c.assetId),
            this.selectedMatchCodeId
          );
        } else {
          this.alertService.error('Cannot match current asset selection.');
          return;
        }
      } else {
        this.editMatchCode(form);
      }
    }
  }

  canDeactivate(): boolean {
    const dirty = this.inventoryGrid.isDirty() && this.clientFileGrid.isDirty();
    return this.canDeactivateService.canDeactivateComponent(dirty);
  }

  toggleShowMatchedRecords(show) {

    this.clearSelectedMatch();

    if (this.inventoryGrid) { this.inventoryGrid.showMatchedRecords(show); }
    if (this.clientFileGrid) { this.clientFileGrid.showMatchedRecords(show); }
  }

  private editMatchCode(form: any) {
    event.preventDefault();

    const errors = new Array<string>();

    this.selectedInventoryItems.concat(this.selectedClientFileItems).forEach(asset => {
      asset.matchCodeId = this.selectedMatchCodeId;

      this.reconcileMatchService.updateMatchCode(asset.matchId, this.selectedMatchCodeId).subscribe(dto => {
        this.reconcileDataService.updateClientFile([asset]);
        this.reconcileDataService.updateInventory([asset]);
        this.toggleShowMatchedRecords(true);
        this.alertService.success('Match saved successfully!');
      });
    });
  }

  onClearSelection(event: DataTargetName) {
    this.clearAssetRecordSelection();
  }

  onSelectionChanged(event: SelectionChangeEvent, isClientFile: Boolean) {
    const addedAssets = event.itemsAdded;
    const removedAssets = event.itemsRemoved;

    if (removedAssets) {
      removedAssets.filter(asset => asset.isParent === true).forEach(parent => this.clientFileGrid.collapseParentChild(true));
    }

    // Check if valid Allocaiton Edit
   if (this.selectedMatchType === this.matchTypes.allocationMatch && !isClientFile) {
      addedAssets.forEach(asset => {
        if (asset.isMatched === true) {
          this.selectedMatchType = null;
        }
      });
    } else {
    this.selectedMatchType = null;
   }

    this.reconcileMatchService.updateCurrentMatch(event);

    this.hasSelectedItems = this.selectedClientFileIds.length > 0 || this.selectedInventoryIds.length > 0;

  }

  /* Begin Reconcile Data Grid Events  */
  onMatchSelected(event: MatchSelectionEvent) {
    this.reconcileMatchService.getMatchSummaryForAssetIds(this.selectedGroupId, [event.asset.assetId]).subscribe(x => {
      const matchAssets = new Array<Asset>();

      if (x.result.assetData.length > 0) {
        this.selectedMatchType = this.reconcileDataService.getMatchType(x.result);

        this.selectedMatchCodeId = x.result.assetData.find(c => !!c.matchCodeId).matchCodeId;

        x.result.assetData.forEach(a => {
          const asset = this.reconcileDataService.mapAsset(a, this.getDataSource(a.allocationId, event.dataSource));

          if (!asset.isChild) { matchAssets.push(asset); }
        });
      }

      this.reconcileMatchService.clearCurrentMatch();
      this.reconcileMatchService.setCurrentMatch(matchAssets);
    });
  }

  onParentChildSelected(asset: Asset) {

    this.selectedMatchType = this.matchTypes.parentChildMatch;

    const matchedAssets = [asset];

    this.reconcileMatchService.clearCurrentMatch();
    this.reconcileMatchService.setCurrentMatch(matchedAssets);

    const currentChildren = [].concat.apply(matchedAssets, matchedAssets.map(c => c.parentChildMatches));
  }

  clearAssetRecordSelection() {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties>{
        heading: {
          key: 'Clear Selected Items'
        },
        body: {
          key: `Are you sure you wish to clear all selected items?`
        },
        dismissText: {
          key: 'Close',
        },
        successText: {
          key: 'Clear'
        },
        translateBaseKey: this.i18n.common
    };

    modal.componentInstance.options = modalOptions;

    modal.result.then(() => {
      this.clearSelectedMatch();
    }).catch(err => { });

  }
  /* End Reconcile Data Grid Events  */

  /* Begin Parent/Child Events  */

  onParentChildMatch(match: ApiServiceResult<ReconciliationSummaryResult[]>) {
    let assetsToUpdate = new Array<AssetDto>();

    match.result.forEach(m => {
      assetsToUpdate = assetsToUpdate.concat(m.assetData);
    });

    if (match.code && match.code !== 0) {
      this.alertService.error('Parent/Child match was not saved.');
      return;
    }
    if (assetsToUpdate.length === 0) { return; }

    this.reconcileGridService.updateCacheRecords(assetsToUpdate, ReconciliationMatchType.parentChildMatch);
    this.clientFileGrid.updateCurrentView(true);

    this.reconcileMatchService.clearCurrentMatch();
    this.allocationService.clearSelections();
    this.clearSelectedMatch();
    this.applyGridFilters();
    this.parentChildService.clearChildren();

    this.alertService.success('Parent/Child saved successfully!');
  }

  onParentChildMatchRemoved(removedEntities: Array<string>) {
    if (removedEntities == null || removedEntities.length === 0) {
      return;
    }

    // this.reconcileDataService.removeParentChildMatches(removedEntities);

    const assetsToUpdate = removedEntities.map(id => {
      const asset = <AssetDto>{
        id: id,
        isParent: false,
        parentId: null
      };
      asset['isChild'] = false;
      asset['isMatched'] = false;
      asset['matchCodeId'] = null;
      asset['matchId'] = null;
      return asset;
    });
    this.reconcileGridService.updateCacheRecords(assetsToUpdate, ReconciliationMatchType.parentChildMatch);
    this.clientFileGrid.updateCurrentView(true);

    this.clearSelectedMatch();
    this.applyGridFilters();
    this.parentChildService.clearChildren();
  }

  onParentChildMatchClick(event: any) {
    event.preventDefault();

    const parentAndChildren = this.selectedClientFileItems.filter(c => c !== undefined);

    if (parentAndChildren.length === 0) {
      this.alertService.error('You have not selected any client assets.');
      return;
    }
    if (parentAndChildren.length === 1 && !parentAndChildren[0].isParent) {
      this.alertService.error('You only have 1 client asset selected.');
      return;
    }
    if (this.selectedInventoryItems.length > 0) {
      this.alertService.error('You can not use Parent/Child with items from the Actual Inventory table.');
      return;
    }
    let matchCount = 0;
    this.selectedClientFileItems.forEach(asset => {
      if (asset.isMatched ) {
        matchCount += 1;
      }
    });
    if (matchCount > 1) {
      this.alertService.error('You cannot create a Parent/Child with more than one matched record.');
      return;
    }

    this.reconcileMatchService.getMatchSummaryForAssetIds(this.selectedGroupId, this.selectedClientFileIds).subscribe(x => {
      const currentChildren = new Array<Asset>();

      x.result.assetData.filter(c => !!c.parentId && c.isParent === false).forEach(child => {
        const asset = <Asset>{
          assetId: child.id,
          oldTagNumber: child.oldTagNumber,
          description: child.description,
          parentId: child.parentId,
          assetTagNumber: child.assetTagNumber
        };
        currentChildren.push(asset);
      });

      this.parentChildService.setChildren(currentChildren);

      this.parentChildMatchComponent.assetsGridData = []
        .concat(this.selectedClientFileItems)
        .concat(this.selectedInventoryItems)
        .concat(this.currentChildren);

      this.parentChildMatchComponent.open(event);
    });
  }

  /* End Parent/Child Events  */

  /* Begin UnMatch Events  */

  unmatchRecords(ignoreCheck: Boolean) {
    const assetIds = [].concat(this.selectedClientFileIds, this.selectedInventoryIds);

    if (assetIds.length <= 0) { return; }

    this.reconcileMatchService.unmatchAssetRecords(assetIds).subscribe(dto => {
      this.reconcileGridService.updateCacheRecords(dto.result.assetData, ReconciliationMatchType.unMatch);
      this.alertService.success('Assets unmatched.');
      this.applyGridFilters();
      this.clearSelectedMatch();
      this.clientFileGrid.updateCurrentView(true);
      this.inventoryGrid.updateCurrentView(true);
    });
  }

  private canUnmatch() {
    const canUnmatch =
      this.selectedClientFileItems.some(x => x.matchId != null) || this.selectedInventoryItems.some(x => x.matchId != null);
    return canUnmatch;
  }

  /* End Unmatch Events  */

  /* Begin Allocation Events  */

  onEditAllocationMatchClick(event: any) {
    this.allocationService.changeSelectedMatchCode(this.selectedMatchCodeId);

    this.reconcileDataAllocationsComponent.open(event);
    this.applyGridFilters();
  }

  onAllocation(allocatedAssets: AssetDto[]) {
    this.reconcileGridService.updateCacheRecords(allocatedAssets, ReconciliationMatchType.allocationMatch);
    this.clientFileGrid.updateCurrentView(true);
    this.inventoryGrid.updateCurrentView(true);
    this.applyGridFilters();
    this.clearSelectedMatch();
  }

  /* End Allocation Events */

  public navigateToMassMatch(event: any) {
    event.preventDefault();
    this.router.navigate([`project-profile/${this.selectedGroupId}/Reconciliation/mass-match`]);
  }

  private onMassMatchSaved(savedMatches: ReconciliationSummaryResult[], isOneToOne: Boolean) {

    let assetsToUpdate = new Array<AssetDto>();
    const inventoryAssets = new Array<AssetDto>();

    savedMatches.forEach(m => {
      assetsToUpdate = assetsToUpdate.concat(m.assetData);
    });

    // Force Grid to get updates from API to handle case where user matched assets not in the current page window.
    this.clientFileGrid.updateCurrentView(true);
    this.inventoryGrid.updateCurrentView(true);

    this.clearSelectedMatch();
  }

  private clearSelectedMatch() {

    this.reconcileGridService.clearSelectionsInProgress();

    this.reconcileMatchService.clearCurrentMatch();
    this.allocationService.clearSelections();

    this.selectedMatchType = null;

    this.hasSelectedItems = this.selectedClientFileIds.length > 0 || this.selectedInventoryIds.length > 0;
  }

  private saveSingleMatches(form: any, assetIds: string[], matchCodeId: string) {
    this.reconcileMatchService.createMassSingleMatch(assetIds, matchCodeId).subscribe(dto => {
      if (dto == null) {
        this.alertService.error('Unexpected service error.');
      }
      if (dto.result == null) {
        this.alertService.error('Unexpected error saving match.');
      }
      if (dto.invalidArguments.length > 0) {
        this.alertService.error('The selected items cannot be saved as a mass single match.');
      }

      // console.log('Single match saved.');
      // console.log(dto);

      this.onMassMatchSaved(dto.result, false);
      this.alertService.success('Single match(es) saved.');
    });
  }

  private saveOneToOneMatches(form: any, clientAssetIds: string[], InventoryAssetIds: string[], matchCodeId: string) {
    this.reconcileMatchService.createMassOneToOneMatch(clientAssetIds, InventoryAssetIds, matchCodeId).subscribe(dto => {
      if (dto == null) {
        this.alertService.error('Unexpected service error.');
      }
      if (dto.result == null) {
        this.alertService.error('Unexpected error saving match.');
      }
      if (dto.invalidArguments.length > 0) {
        this.alertService.error('The selected items cannot be saved as a mass one to one match.');
      }

      // console.log('One to one match saved.');
      // console.log(dto);

      this.onMassMatchSaved(dto.result, true);
      this.alertService.success('One to one match(es) saved.');
    });
  }

  private applyGridFilters() {
    if (this.clientFileGrid) { this.clientFileGrid.filterGrid(); }
    if (this.inventoryGrid) { this.inventoryGrid.filterGrid(); }
  }

  private getDataSource(allocationId: string, selectedMatchSource: DataTargetName): DataTargetName {
    if (this.selectedMatchType !== ReconciliationMatchType.singleMatch) {
      return allocationId ? DataTargetName.inventory : DataTargetName.client;
    } else {
      return selectedMatchSource;
    }
  }

  public onAllocationMatchClick(event: any) {
    event.preventDefault();

    this.reconcileDataAllocationsComponent.launchAllocationModal();
  }

  onBack(event: any) {
    this.router.navigate(['./setup'], {
      relativeTo: this.route.parent
    });
  }

  onContinue(event: any) {
    this.isBusy = true;

      this.reconcileDataService.validateReconciliation(false).subscribe(result => {
        if (result.isReconciliationComplete) {
          this.showValidationErrors = false;
          this.router.navigate(['./define-layout'], {
            relativeTo: this.route.parent
          });
        } else {
          this.showValidationErrors = true;
          this.reconciliationValidationComponent.open('./define-layout');
        }
      });
  }

  public onValidateReconciliation() {
    this.isBusy = true;

    this.reconcileDataService.validateReconciliation(false).subscribe(result => {
      if (result.isReconciliationComplete) {
        this.showValidationErrors = false;
        this.alertService.success('Reconciliation is complete.');
      } else {
        this.showValidationErrors = true;
        this.reconciliationValidationComponent.open();
      }
    });
  }
}
