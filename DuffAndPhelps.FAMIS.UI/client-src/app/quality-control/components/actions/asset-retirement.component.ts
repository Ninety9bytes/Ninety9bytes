import { FormGroupDirective, NgForm } from '@angular/forms';

import { QualityControlActionsService } from '../../services/actions/quality-control-actions.service';
import { QualityControlService } from '../../services/quality-control.service';
import { AlertService } from '../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Input, ViewContainerRef } from '@angular/core';
import { Asset } from '../../../_models/asset.model';
import { DisposalCode } from '../../../_api/_runtime/enums/disposal-code';
import { TransactionApplicability } from '../../../_api/_runtime/enums/transaction-applicability';
import { TransactionRequestDto } from '../../../_api/_runtime/dtos/transaction-request.dto';
import { ModalFormEvent } from '../../../_enums/modal-form-event';
import { TransactionType } from '../../../_api/_runtime/enums/transaction-type';

@Component({
  selector: 'asset-retirement',
  templateUrl: './asset-retirement.component.html'
})
export class AssetRetirementComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('assetRetirementForm', {static: true}) form: FormGroupDirective;
  @Input() modalTitle: string;
  @Input() assetsCollection: Array<Asset>;

  public disposalCodes = DisposalCode;
  public applicability = TransactionApplicability;

  assetRetirement = <TransactionRequestDto>{};
  submitted = false;
  disablePartial = false;
  formHasErrors = false;
  formErrorText = '';

  public status: ModalFormEvent;

  constructor(
    public actionsService: QualityControlActionsService,
    public qualityControlService: QualityControlService,
    public alertService: AlertService,
    private windowManager: WindowManager,
    public container: ViewContainerRef
  ) {}

  ngOnInit() {
    this.assetRetirement.assets = this.assetsCollection.map(c => c['id']);
    this.assetRetirement.transactionType = TransactionType.Retirement;

    if (this.assetsCollection.length > 1) {
      this.disablePartial = true;
      this.assetRetirement.transactionApplicability = TransactionApplicability.Full;
    }
  }

  handleModalEvent(modalEvent: ModalFormEvent) {
    if (modalEvent === ModalFormEvent.Save) {
      this.form.ngSubmit.emit();
    }

    if (modalEvent === ModalFormEvent.Dismiss) {
      this.dismiss();
    }
  }

  retireAssets(form: NgForm) {
    this.submitted = true;

    if (!this.errorCheck() && form.valid && this.assetRetirement.asOf && this.assetRetirement.disposalCode) {
      // For partial retirement, check if cost equals historial cost, if so set to full retirement
      if (
        this.assetRetirement.transactionApplicability === TransactionApplicability.Partial &&
        this.assetRetirement.costChange &&
        this.assetRetirement.costChange === this.assetsCollection[0].historicalCost
      ) {
        this.assetRetirement.transactionApplicability = TransactionApplicability.Full;
      }

      // For partial retirement, check if quantity equals original quantity, if so set to full retirement
      if (
        this.assetRetirement.transactionApplicability === TransactionApplicability.Partial &&
        this.assetRetirement.quantityChange &&
        // tslint:disable-next-line:no-bitwise
        this.assetRetirement.quantityChange === ~~this.assetsCollection[0]['quantity']
      ) {
        this.assetRetirement.transactionApplicability = TransactionApplicability.Full;
      }
      this.actionsService.processTransaction(this.assetRetirement).subscribe(
        result => {
          this.status = ModalFormEvent.Success;

          this.windowManager.close();

          this.alertService.success('Asset(s) retired successfully');
        },
        error => {
          this.status = ModalFormEvent.Failed;

          this.windowManager.close();

          if (error.status === 400) {
            this.alertService.error('Asset(s) have already been retired or lacks a building ID.');
          }
        }
      );
    }
  }

  dismiss() {
    this.windowManager.close();
  }

  equalityCheck(newValue: number, oldValue: number): boolean {
    let retValue = false;
    if (oldValue !== null) {
      retValue = this.assetsCollection.length === 1 && !!newValue && newValue === parseFloat(oldValue.toString());
    }
    return retValue;
  }

  errorCheck() {
    this.formHasErrors = false;

    if (this.assetRetirement.transactionApplicability === TransactionApplicability.Partial) {
      const asset = this.assetsCollection[0];

      // If cost entered
      if (!isNaN(this.assetRetirement.costChange)) {
        // If cost > historial cost
        if (this.assetRetirement.costChange > asset.historicalCost) {
          this.formHasErrors = true;
          this.formErrorText = 'Retirement cost is greater than historial cost (' + asset.historicalCost + '), please review cost entry.';
        } else if (this.assetRetirement.costChange <= 0) {
          this.formHasErrors = true;
          this.formErrorText = 'Retirement cost should be greater than 0.';
        }
      }

      // If quantity entered
      if (!isNaN(this.assetRetirement.quantityChange)) {
        // If cost > historial cost
        if (this.assetRetirement.quantityChange > asset['quantity']) {
          this.formHasErrors = true;
          this.formErrorText =
            'Retirement quantity is greater than original quantity (' + asset['quantity'] + '), please review quantity entry.';
        } else if (this.assetRetirement.quantityChange <= 0) {
          this.formHasErrors = true;
          this.formErrorText = 'Retirement quantity should be greater than 0.';
        }
      }
    }

    return this.formHasErrors;
  }

  checkForTypeUndefined(variable: any) {
    if (typeof variable === 'undefined') {
      return true;
    }

    return false;
  }
}
