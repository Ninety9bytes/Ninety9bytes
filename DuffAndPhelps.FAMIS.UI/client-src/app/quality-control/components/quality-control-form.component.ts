import { QualityControlService } from '../services/quality-control.service';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { AssetRetirementComponent } from './actions/asset-retirement.component';
import { AssetTransferComponent } from './actions/asset-transfer.component';
import { CostAdjustmentComponent } from './actions/cost-adjustment.component';
import { AlertService } from '../../_core/services/alert.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { QualityControlActions } from '../enums/quality-control-actions';
import { QualityControlModes } from '../enums/quality-control-modes';
import { QualityControlBuildingGridComponent } from './building/quality-control-building-grid.component';
import { QualityControlContentGridComponent } from './content/quality-control-content-grid.component';
import { BuildingValuationComponent } from '../components/building/actions/building-valuation.component';
import { FloodPlainValuationComponent } from '../components/building/actions/floodplain-valuation.component';
import { SystemPermissionsEnum } from '../../_core/user/permissions';
import { UserStore } from '../../_core/user/user.store';
import { User } from '../../_core/user/user';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FamisGrid } from '../../_models/shared/famis-grid-state.model';
import { Asset } from '../../_models/asset.model';
import { Building } from '../../_models/building.model';
import { DataItemValue } from '../../_models/data-item-value.model';
import { Router, ActivatedRoute } from '@angular/router';
import { WindowOption } from '../../_models/window-option';
import { ModalFormEvent } from '../../_enums/modal-form-event';

@Component({
  selector: 'quality-control-form',
  templateUrl: './quality-control-form.component.html'
})
export class QualityControlFormComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  dataGrid: FamisGrid;
  buildingGrid: FamisGrid;
  modalActions = QualityControlActions;
  qualityControlModes = QualityControlModes;
  mode: QualityControlModes = QualityControlModes.Content;
  selectedAssets = new Array<Asset>();
  selectedBuildings = new Array<Building>();
  actionSelected: QualityControlActions;
  showValuationErrorsButton = false;
  action = '';
  buildingGridInitialized = false;
  permissions = SystemPermissionsEnum;
  user: User;

  @ViewChild(QualityControlBuildingGridComponent, {static: false})
  qualityControlBuildingGridComponent: QualityControlBuildingGridComponent;
  @ViewChild(QualityControlContentGridComponent, {static: false})
  qualityControlContentGridComponent: QualityControlContentGridComponent;

  @ViewChild(BuildingValuationComponent, {static: false})
  buildingValuationComponent: BuildingValuationComponent;
  @ViewChild(FloodPlainValuationComponent, {static: false})
  floodPlainValuationComponent: FloodPlainValuationComponent;

  private editedRecords = new Array<DataItemValue>();

  statusExists = true;

  constructor(
    private qualityControlService: QualityControlService,
    private router: Router,
    private famisGridService: FamisGridService,
    private alertService: AlertService,
    private dropDownConfig: NgbDropdownConfig,
    private route: ActivatedRoute,
    private userStore: UserStore,
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    private canDeactivateService: CanDeactivateService
  ) {
    this.dropDownConfig.placement = 'bottom-right';
  }

  isLoading = true;

  ngOnInit() {
    this.famisGridService.editedRecords$.subscribe(editedRecords => {
      this.editedRecords = editedRecords;
    });

    this.statusExists = this.qualityControlService.statisExists;

    const selectedMode = this.route.snapshot.queryParams['mode'];

    switch (selectedMode) {
      case '0':
        this.mode = QualityControlModes.Content;
        break;
      case '1':
        this.mode = QualityControlModes.Buildings;
        break;
    }

    this.userStore.user.subscribe(currentUser => {
      this.user = currentUser;
    });
  }

  ngOnDestroy() {}

  add() {

    if (this.checkIfCanNavigateAway()) {

      if (this.mode === QualityControlModes.Content) {
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/AddContent`]);
      }
      if (this.mode === QualityControlModes.Buildings) {
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/AddBuilding`]);
      }
    }
  }

  duplicate() {

    if (this.checkIfCanNavigateAway()) {

    if (this.mode === QualityControlModes.Content) {
      this.router.navigate([
        `/project-profile/${this.qualityControlService.groupId}/QualityControl/EditContent/${this.selectedAssets[0].id}`],
        { queryParams: { isDuplicate: true } });
    }
  }
  }

  massUpdate() {
    if (this.checkIfCanNavigateAway()) {
    if (this.mode === QualityControlModes.Content) {
      this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/MassUpdate/Content`], {
        queryParams: { mode: 0 }
      });
    }

    if (this.mode === QualityControlModes.Buildings) {
      this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/MassUpdate/Building`], {
        queryParams: { mode: 1 }
      });
    }
  }
  }

  duplicateCheck() {
    if (this.checkIfCanNavigateAway()) {
    this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/DuplicateCheck`]);
    }
  }

  selectAction(action: QualityControlActions) {
    if (action === QualityControlActions.RetireAsset) {
      const assetRetirementWindow = this.windowManager.open(AssetRetirementComponent, 'Asset Retirement', <WindowOption>{
        isModal: true
      });

      assetRetirementWindow.content.instance.assetsCollection = this.selectedAssets;

      assetRetirementWindow.result.subscribe(success => {
        if (assetRetirementWindow.content.instance.status === ModalFormEvent.Success) {
          this.qualityControlContentGridComponent.updateCache();
        }
      });
    }

    if (action === QualityControlActions.TransferAsset) {
      const assetTransferWindow = this.windowManager.open(AssetTransferComponent, 'Asset Transfer', <WindowOption>{
        isModal: true
      });

      assetTransferWindow.content.instance.assetsCollection = this.selectedAssets;

      assetTransferWindow.result.subscribe(success => {
        if (assetTransferWindow.content.instance.status === ModalFormEvent.Success) {
          this.alertService.success((this.selectedAssets.length === 1 ? 'Asset' : 'Assets') + ' transferred successfully.');

          this.qualityControlContentGridComponent.updateCache();
        }
      });
    }

    if (action === QualityControlActions.CostAdjustment) {
      const costAdjustmentWindow = this.windowManager.open(CostAdjustmentComponent, 'Cost Adjustment', <WindowOption>{
        isModal: true
      });

      costAdjustmentWindow.content.instance.selectedAsset = this.selectedAssets[0];

      costAdjustmentWindow.result.subscribe(success => {
        if (costAdjustmentWindow.content.instance.status === ModalFormEvent.Success) {
          this.qualityControlContentGridComponent.updateCache();
        }
      });
    }

    if (action === QualityControlActions.BuildingValuation) {
      this.actionSelected = action;
      if (this.selectedBuildings.length > 0) {
        this.buildingValuationComponent.open(false, this.selectedBuildings);
      } else if (this.selectedBuildings.length === 0) {
        this.alertService.info('Please select a minimum of 1 building to submit for valuation', false);
      }
    }

    if (action === QualityControlActions.FloodPlanValuation) {
      this.actionSelected = action;
      if (this.selectedBuildings.length > 0) {
        this.floodPlainValuationComponent.open(false, this.selectedBuildings);
      } else if (this.selectedBuildings.length === 0) {
        this.alertService.info('Please select a minimum of 1 building to submit for valuation', false);
      }
    }
  }

  toggleQualityControlMode(mode: QualityControlModes) {
    if (this.canDeactivateService.canDeactivateComponent(this.editedRecords.length > 0)) {
      this.mode = mode;
    }
  }

  userCanWriteData() {
    let canWriteData = false;

    if (this.user) {
      const grantedPermissionIndex = this.user.permissions.permissionsGranted.findIndex(c => c === this.permissions.canWriteData);
      canWriteData = grantedPermissionIndex > -1;
    }

    return canWriteData;
  }

  handleAction(response: boolean) {
    this.showValuationErrorsButton = response;
  }

  openModal() {
    if (this.actionSelected === QualityControlActions.BuildingValuation) {
      this.buildingValuationComponent.open(true, this.selectedBuildings);
    } else if (this.actionSelected === QualityControlActions.FloodPlanValuation) {
      this.floodPlainValuationComponent.open(true, this.selectedBuildings);
    }
  }

  public contentReferenceDataLoaded(): boolean {
    return !!this.qualityControlService.status && !!this.qualityControlService.activityCodeOptions &&
      !!this.qualityControlService.assetFileSummary && !!this.qualityControlService.accountOptions;
  }

  public buildingReferenceDataLoaded(): boolean {
    return !!this.qualityControlService.buildingSelectionOptions && !!this.qualityControlService.groupDepartmentOptions;
  }

  private checkIfCanNavigateAway(): boolean {
    return this.canDeactivateService.canDeactivateComponent(this.editedRecords.length > 0);

  }
}
