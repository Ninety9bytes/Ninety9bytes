import { FormGroupDirective, NgForm, FormGroup } from '@angular/forms';
import { QualityControlActionsService } from '../../services/actions/quality-control-actions.service';
import { QualityControlService } from '../../services/quality-control.service';
import { BuildingInfoService } from '../../../_core/services/building-info-service';
import { AlertService } from '../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Asset } from '../../../_models/asset.model';
import { CascadedSelectOption } from '../../../_models/cascaded-select-option.model';
import { CascadedSelectValue } from '../../../_models/cascaded-select-value.model';
import { TransactionRequestDto, TransferFieldDto } from '../../../_api/_runtime/dtos/transaction-request.dto';
import { DepartmentDto } from '../../../_api/_runtime/dtos/department.dto';
import { AccountDto } from '../../../_api/_runtime/dtos/account.dto';
import { ModalFormEvent } from '../../../_enums/modal-form-event';
import { TransactionApplicability } from '../../../_api/_runtime/enums/transaction-applicability';
import { TransactionType } from '../../../_api/_runtime/enums/transaction-type';

@Component({
  selector: 'asset-transfer',
  templateUrl: './asset-transfer.component.html'
})
export class AssetTransferComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('assetTransferForm', {static: true}) formGroup: FormGroupDirective;
  @Input() modalTitle: string;
  @Input() assetsCollection: Array<Asset>;

  public groupHierarchy: Array<CascadedSelectOption>;
  public groupHierarchySelectValues: Array<CascadedSelectValue>;
  assetTransfer = <TransactionRequestDto>{};
  submitted = false;
  disablePartial = false;
  hidePartialFields = true;

  public departmentOptions: Array<DepartmentDto>;
  public accountOptions: Array<AccountDto>;
  public errorMessage = '';
  public memberSiteBuilding = '';
  public status: ModalFormEvent;

  // Form Fields
  public selectedAccountId: string;
  public selectedDepartmentId: string;
  public applicability = TransactionApplicability;
  public floorValue: string;
  public roomValue: string;
  public siteId: string;
  public buildingId: string;
  public costChange: number;
  public quantityChange: number;
  private partialAsset: Asset;
  public isFiscalYearEndValid: boolean;

  constructor(
    public actionsService: QualityControlActionsService,
    public qualityControlService: QualityControlService,
    public buildingInfoService: BuildingInfoService,
    public alertService: AlertService,
    private windowManager: WindowManager
  ) {}

  ngOnInit() {
    this.assetTransfer.transactionType = TransactionType.Transfer;
    this.assetTransfer.assets = this.assetsCollection.map(c => c['id']);

    if (this.assetsCollection.length > 1) {
      this.disablePartial = true;
      this.assetTransfer.transactionApplicability = this.applicability.Full;
    }
    this.partialAsset = this.assetsCollection[0];

    this.groupHierarchySelectValues = [
      <CascadedSelectValue>{ displayName: 'Member', name: 'member' },
      <CascadedSelectValue>{ displayName: 'Site', name: 'siteId' },
      <CascadedSelectValue>{ displayName: 'Building', name: 'buildingId' }
    ];
    this.buildingInfoService.getBuildingHierarchyByGroupId(this.qualityControlService.groupId).subscribe(hierachy => {
      this.groupHierarchy = this.buildingInfoService.mapSitesToSelectOptions(hierachy);
    });
    this.qualityControlService.getDepartmentData(this.qualityControlService.groupId).subscribe(result => {
      this.departmentOptions = result;
    });
    this.qualityControlService.getAccountData(this.qualityControlService.groupId).subscribe(result => {
      this.accountOptions = result;
    });
    this.qualityControlService.hasFiscalYearEnd().subscribe(res => {
      this.isFiscalYearEndValid = res;
    });
  }

  handleModalEvent(modalEvent: ModalFormEvent) {
    if (modalEvent === ModalFormEvent.Save) {
      this.formGroup.ngSubmit.emit();
    }

    if (modalEvent === ModalFormEvent.Dismiss) {
      this.dismiss();
    }
  }

  transferAssets(form: NgForm) {
    this.submitted = true;

    if (this.formGroup.value.memberSiteBuilding) {
      this.siteId = this.formGroup.value.memberSiteBuilding.split(',')[1];
      this.buildingId = this.formGroup.value.memberSiteBuilding.split(',')[2];
    }

    if (form.valid && !this.hasErrors()) {
      this.assetTransfer.transferFields = new Array<TransferFieldDto>();

      const transferFieldArr: Array<TransferFieldDto> = [
        { destinationField: 'accountId', destinationValue: this.selectedAccountId },
        { destinationField: 'departmentId', destinationValue: this.selectedDepartmentId },
        { destinationField: 'siteId', destinationValue: this.siteId },
        { destinationField: 'buildingId', destinationValue: this.buildingId },
        { destinationField: 'floor', destinationValue: this.floorValue },
        { destinationField: 'room', destinationValue: this.roomValue }
      ];

      transferFieldArr.forEach(obj => {
        if (obj.destinationValue) {
          this.assetTransfer.transferFields.push(obj);
        }
      });

      this.actionsService.processTransaction(this.assetTransfer).subscribe(
        result => {
          if (result.impactedAssets) {
            this.status = ModalFormEvent.Success;
            this.windowManager.close();
          } else {
            this.alertService.error(result.status);

            this.status = ModalFormEvent.Failed;

            this.windowManager.close();
          }
        },
        error => {
          this.status = ModalFormEvent.Failed;

          this.alertService.error('An error has occurred while processing the transfer');


          this.windowManager.close();
        }
      );
    }
  }

  dismiss() {
    this.windowManager.close();
  }

  checkDisablePartial(event: any) {
    if (this.assetTransfer.transactionApplicability === this.applicability.Full) {
      this.hidePartialFields = true;
    } else {
      this.hidePartialFields = false;
    }
  }

  // TODO Tech Debt: Refactor at a later time
  hasErrors(): boolean {
    const form: FormGroup = this.formGroup.form;

    if (!this.isFiscalYearEndValid) {
      this.errorMessage = 'Cannot complete transfer. Fiscal Year End is not set.';
      return true;
    }

    if (form.value.type !== 0 && form.value.type !== 1) {
      this.errorMessage = 'Please select transfer type (Full or Partial).';
      return true;
    }

    if (this.assetTransfer.transactionApplicability === 1) {
      if (this.assetTransfer.costChange) {
        if (
          this.assetTransfer.costChange === 0 ||
          Math.abs(this.assetTransfer.costChange) > this.partialAsset.historicalCost ||
          this.assetTransfer.costChange > 0
        ) {
          this.errorMessage = 'Cost change must be between 0 and -' + this.partialAsset.historicalCost;
          return true;
        }
      }
      if (this.assetTransfer.quantityChange) {
        if (!this.partialAsset.quantity) {
          this.errorMessage
          = 'Cannot transfer asset without quantity. please enter correct quantity for the asset and reapply the transfer.';
          return true;
        }
        if (
          this.assetTransfer.quantityChange === 0 ||
          Math.abs(this.assetTransfer.quantityChange) > this.partialAsset.quantity ||
          this.assetTransfer.quantityChange > 0
        ) {
          this.errorMessage = 'Quantity transfer must be between 0 and -' + this.partialAsset.quantity;
          return true;
        }
      }
      if (this.assetTransfer.costChange && this.assetTransfer.quantityChange) {
        this.errorMessage = 'Cannot transfer both Cost and Quanity, please specifiy either Cost or Quantity for partial transfer.';
        return true;
      }
      if (!this.assetTransfer.costChange && !this.assetTransfer.quantityChange) {
        this.errorMessage = 'Please specify either Cost or Quantity for partial transfer.';
        return true;
      }
    }

    let validValues = 0;

    Object.values(form.value).forEach(element => {
      if (element) {
        validValues++;
      }
    });

    if ((validValues >= 2 && form.value.type === 1) || (validValues >= 1 && form.value.type === 0)) {
      return false;
    } else {
      this.errorMessage = 'Please enter a value in one of fields for the transfer to be completed.';
      return true;
    }
  }
}
