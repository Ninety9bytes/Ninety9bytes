import { AllocationService } from '../services/allocation.service';
import { AlertService } from '../../_core/services/alert.service';
import { ReconcileMatchService } from '../services/reconcile-match.service';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { ReconcileDataAllocations } from '../../_models/reconcile-allocation.model';
import { AssetDto } from '../../_api/dtos/reconciliation/reconciliation-summary-result.dto';
import { Asset } from '../../_models/asset.model';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { CostFieldsService } from '../../_api/services/reconciliation/cost-fields.service';
import { CalculationApiService } from '../../_api/_runtime/services/calculation-api.service';
import { DataTargetName } from '../../_enums/data-target-name';
import { ReconciliationStatus } from '../../_enums/reconciliationStatus';
import { WindowOption } from '../../_models/window-option';
import { ReconciliationAllocationDto } from '../../_api/dtos/reconcilation-allocation.dto';
import { ReconciliationMatchDto } from '../../_api/dtos/reconcilation-match.dto';

@Component({
  selector: 'reconcile-data-allocations',
  templateUrl: './reconcile-data-allocations.component.html'
})
export class ReconcileDataAllocationsComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @ViewChild('content', {static: false})
  content: any;
  title = 'Allocation';
  isConfirmOpen = false;
  confirmMessage = '';
  confirmHeader= '';
  vm: ReconcileDataAllocations;
  @Output()
  allocation = new EventEmitter<AssetDto[]>();
  @Output()
  allocationUnmatchAll = new EventEmitter();
  selectedClientAssets: Array<Asset>;
  selectedInventoryAssets: Array<Asset>;
  matchCode: string;
  costField: string;
  allocationCost: number;
  inventoryAssetsToRemove: Array<Asset>;
  remainingBalance = 0;

  windowRef: WindowRef;


  constructor(
    private windowManager: WindowManager,
    private allocationService: AllocationService,
    private alertService: AlertService,
    private reconcilationMatchService: ReconcileMatchService,
    private reconcileMatchService: ReconcileMatchService,
    private costFieldsService: CostFieldsService,
    private reconcileDataService: ReconcileDataService,
    private calculationService: CalculationApiService,
    private container: ViewContainerRef
  ) {}

  ngOnInit() {
    const s = this;

    this.allocationService.currentSelectedMatchCode.subscribe(matchCode => (this.matchCode = matchCode));

    this.reconcileMatchService.selectedMatch$.subscribe(match => {
      this.selectedClientAssets = match.filter(c => c.dataSource === DataTargetName.client);
      this.selectedInventoryAssets = match.filter(c => c.dataSource === DataTargetName.inventory);
    });

    this.costFieldsService.getGroupCostField(this.reconcileDataService.groupId).subscribe(field => {
      if (field === null || field.assetFileField.length === 0) { s.costField = 'historicalCost'; } else {
        s.costField = field.assetFileField.charAt(0).toLowerCase() + field.assetFileField.slice(1);
      }
    });
  }

  open(event: any) {
    event.preventDefault();

    this.launchAllocationModal();
  }

  launchAllocationModal() {
    this.isConfirmOpen = false;
    if (this.matchCode === '' || this.matchCode == null) {
      this.alertService.error('Select a match code to create an allocation.');
      return;
    }
    if (this.selectedClientAssets.length > 1) {
      this.alertService.error('Cannot create allocations for more than one client record at a time.');
      return;
    }
    if (this.selectedClientAssets.length === 0) {
      this.alertService.error('A client record must be selected to create an allocation.');
      return;
    }
    if (this.selectedInventoryAssets.length === 0) {
      this.alertService.error('At least one inventory item must be selected to create or modify an allocation.');
      return;
    }
    this.inventoryAssetsToRemove = new Array<Asset>();
    // If we made it this far, get the reconcilation matches and verify selction is elligable for allocation.
    const ids = new Array<string>();
    ids.push(this.selectedClientAssets[0].assetId);
    this.reconcilationMatchService.getMatchSummaryForAssetIds(this.reconcileDataService.groupId, ids).subscribe(result => {
      if (result.code === ReconciliationStatus.Success && result.result != null) {
        const allMatchedAssets = result.result.assetData;
        // console.log(result);

        if (this.isValidAssetSelectionForExistingAllocation(allMatchedAssets)) {
          // Launch Modal in modify/view mode
          this.initializeUpdateViewModel(allMatchedAssets);
        } else if (this.isValidAssetSelectionForNewAllocation(allMatchedAssets)) {
          // Launch Modal in new allocation mode
          this.initializeViewModel();
        } else {
          this.alertService.error('The selected assets are not valid for creating or modifying an allocation.');
          return;
        }

        this.windowRef = this.windowManager.open(this.content, this.title, <WindowOption>{
          isModal: true,
          translationKey: this.i18n.reconciliation,
          top: -100,
          left: -900,
          width: 800
        });

      } else {
        // Bad API status
        this.alertService.error('An unexpected error has occurred. Allocation cannot be created at this time.');
        return;
      }
    });
  }

  allocateEvenly(event: any) {
    event.preventDefault();
    this.calculationService
      .Allocate(parseFloat(this.vm.allocationClientAsset[this.costField]), this.vm.allocationInventoryAssets.length)
      .subscribe(res => {
        for (let i = 0; i < res.length; i++) {
          this.vm.allocationInventoryAssets[i].allocatedValue = parseFloat(res[i]);
        }
        this.updateTotal();
      });
  }

  onSubmit(form) {
    if (this.vm.isValidAllocation) {
      const allocations: Array<ReconciliationAllocationDto> = new Array<ReconciliationAllocationDto>();
      this.vm.allocationInventoryAssets.forEach(asset => {
        // console.log('Asset ' + asset.assetId + ' allocation: ' + asset.allocatedValue);
        const allocation: ReconciliationAllocationDto = {
          assetRecordId: asset.assetId,
          allocatedValue: asset.allocatedValue
        };
        allocations.push(allocation);
      });
      // Save Allocation
      if (this.vm.isNewAllocation) {
        this.createNewAllocation(allocations);
      } else {
        this.updateExistingAllocation(allocations);
      }
    }
  }

  private createNewAllocation(allocations: Array<ReconciliationAllocationDto>) {
    this.reconcilationMatchService
      .setAllocationMatch(this.vm.allocationClientAsset.assetId, allocations, this.matchCode)
      .subscribe(result => {
        if (result.code === ReconciliationStatus.Success) {
          const assetsModified = this.mapAllocationResult(result.result);

          this.allocation.emit(assetsModified);
          this.alertService.success('Allocation match saved!');
        } else {
          this.alertService.error('An unexpected error occurred. Allocation cannot be created at this time.');
        }
        this.windowRef.close();
      });
  }

  private updateExistingAllocation(allocations: Array<ReconciliationAllocationDto>) {
    this.reconcilationMatchService
      .updateAllocationMatch(
        this.vm.allocationClientAsset.assetId,
        allocations,
        this.matchCode,
        this.vm.parentAssetFileRecordId,
        this.vm.matchId
      )
      .subscribe(result => {
        if (result.code === ReconciliationStatus.Success) {
          const assetsModified = this.mapAllocationResult(result.result);

          this.allocation.emit(assetsModified);
          this.alertService.success('Allocation match saved!');
        } else {
          this.alertService.error('An unexpected error occurred. Allocation cannot be created at this time.');
        }
        this.windowRef.close();
      });
  }

  private mapAllocationResult(result: ReconciliationMatchDto): Array<AssetDto> {

    const assetsModified = new Array<AssetDto>();

    if (result && result.allocations.length > 0) {
      result.allocations.forEach(a => {
        const allocatedAsset = this.vm.allocationInventoryAssets.find(c => c.assetId === a.assetRecordId);
        const res = this.mapAssetDto(allocatedAsset);
        res.matchId = result.matchId;
        res.matchCodeId = result.matchCodeId;
        res.historicalCost = a.allocatedValue;

        assetsModified.push(res);
      });

      const clientAsset = this.mapAssetDto(this.vm.allocationClientAsset);
      clientAsset.matchId = result.matchId;
      clientAsset.matchCodeId = result.matchCodeId;

      assetsModified.push(clientAsset);
    }

    this.inventoryAssetsToRemove.forEach(asset => {
      const assetDto = this.mapAssetDto(asset);
      assetDto.matchCodeId = '';
      assetDto.historicalCost = asset.historicalCost;
      assetDto.matchId = '';
      assetsModified.push(assetDto);
    });
    return assetsModified;
  }

  private mapAssetDto(asset: Asset): AssetDto {
    const res = <AssetDto>{};
    res.id = asset.assetId;
    res.parentId = asset.parentId;
    res.isParent = asset.isParent;
    res.oldTagNumber = asset.oldTagNumber;
    res.description = asset.description;
    res.assetTagNumber = asset.assetTagNumber;
    res.dataSource = asset.dataSource;
    res.historicalCost = asset.historicalCost;
    return res;
  }

  updateTotal() {
    this.vm.isValidAllocation = true;
    this.vm.allocationTotal = 0;
    this.vm.allocationInventoryAssets.forEach(asset => {
      if (asset.allocatedValue < 0) {
        this.vm.isValidAllocation = false;
      }
      this.vm.allocationTotal += Number(asset.allocatedValue);
    });
    this.vm.allocationTotal = Number(this.vm.allocationTotal.toFixed(2));
    this.remainingBalance = Number((this.vm.allocationClientAsset.historicalCost - this.vm.allocationTotal).toFixed(2));
    if (this.vm.isValidAllocation) {
      this.vm.isValidAllocation = this.vm.allocationTotal <= this.vm.allocationClientAsset[this.costField];
    }
  }

  private isValidAssetSelectionForNewAllocation(matchedAssets: AssetDto[]): boolean {
    let returnVal = true;
    matchedAssets.forEach(asset => {
      if (asset.matchId || asset.matchCodeId) {
        returnVal = false;
      }
    });

    if (!returnVal) {
      this.alertService.error('The selected inventory items contain at least one asset that has already been allocated.');
    }
    if (returnVal) {
      // console.log('Valid Asset selction for new Allocation');
    }
    return returnVal;
  }

  private isValidAssetSelectionForExistingAllocation(matchedAssets: AssetDto[]): boolean {
    const clientAsset = this.selectedClientAssets[0];
    const matchCodeId = clientAsset.matchCodeId;
    const matchId = clientAsset.matchId;
    if (!matchCodeId && !matchId) {
      return false;
    }

    const clientAssetIndex = matchedAssets.findIndex(m => m.id === clientAsset.assetId);
    if (clientAssetIndex === -1) {
      return false;
    }

    this.selectedInventoryAssets.forEach(invAsset => {
      if (invAsset.matchId && invAsset.matchCodeId) {
        const matchedAssetIndex = matchedAssets.findIndex(m => m.id === invAsset.assetId);
        if (matchedAssetIndex === -1) {
          return false;
        }
        const matchAsset = matchedAssets[matchedAssetIndex];
        if (matchAsset.matchCodeId !== matchCodeId || matchAsset.matchId !== matchId) {
          return false;
        }
      }
    });

    matchedAssets.splice(clientAssetIndex, 1);
    if (this.selectedInventoryAssets.length < matchedAssets.length) {
      return false;
    }
    return true;
  }

  private initializeViewModel() {
    this.vm = {
      allocationTotal: 0,
      isNewAllocation: true,
      allocationClientAsset: this.selectedClientAssets.slice(0)[0],
      allocationInventoryAssets: this.selectedInventoryAssets.slice(),
      isValidAllocation: true,
      matchId: '',
      parentAssetFileRecordId: ''
    };
    this.vm.allocationInventoryAssets.forEach(asset => {
      asset.allocatedValue = 0;
    });

    this.allocationCost = this.setAllocationCost();
  }

  private setAllocationCost(): number {
    if (this.costField === null) { return 0; }
    if (!this.vm.allocationClientAsset[this.costField]) { return 0; }
    return Number((this.vm.allocationClientAsset[this.costField] * 1).toFixed(2));
  }

  private initializeUpdateViewModel(matchedAssets: AssetDto[]) {
    this.vm = {
      allocationTotal: 0,
      isNewAllocation: false,
      allocationClientAsset: this.selectedClientAssets.slice(0)[0],
      allocationInventoryAssets: this.selectedInventoryAssets.slice(),
      isValidAllocation: true,
      matchId: this.selectedClientAssets[0].matchId,
      parentAssetFileRecordId: this.selectedClientAssets[0].parentId
    };
    this.vm.allocationInventoryAssets.forEach(asset => {
      const allocation = matchedAssets.find(x => x.id === asset.assetId);
      if (allocation !== undefined) { asset.allocatedValue = allocation.historicalCost; } else {
        asset.allocatedValue = 0.0;
      }
    });
    this.allocationCost = this.setAllocationCost();
    this.updateTotal();
  }

  public unmatchRecord(event: any, assetId: string) {
    event.preventDefault();
    // Check if last allocation
    if (this.vm.allocationInventoryAssets.length === 1) {
      this.confirmHeader = 'Confirm';
      this.confirmMessage = 'Are you sure you want to remove this allocation? This will delete the match for these records.';
      this.isConfirmOpen = true;
    }
    const asset = this.vm.allocationInventoryAssets.find(i => i.assetId === assetId);
    const index = this.vm.allocationInventoryAssets.indexOf(asset);
    this.inventoryAssetsToRemove.push(asset);
    this.vm.allocationInventoryAssets.splice(index, 1);
    this.updateTotal();
  }

  cancel(): void {
    this.windowRef.close();
  }

  public unmatchAll(event: any) {
    event.preventDefault();
    this.confirmHeader = 'Confirm';
    this.confirmMessage = 'Are you sure you want to delete the match for these records?';
    this.isConfirmOpen = true;
  }

  public onConfirmed(isConfirmed: boolean) {
    this.isConfirmOpen = false;
    if (isConfirmed) {
      this.removeEntireAllocationMatch();
    }
  }

  private removeEntireAllocationMatch() {
    this.allocationUnmatchAll.emit();
    this.windowRef.close();
  }
}
