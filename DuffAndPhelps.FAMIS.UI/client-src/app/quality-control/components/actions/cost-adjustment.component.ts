import { FormGroupDirective, NgForm } from '@angular/forms';

import { QualityControlActionsService } from '../../services/actions/quality-control-actions.service';
import { QualityControlService } from '../../services/quality-control.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TransactionRequestDto } from '../../../_api/_runtime/dtos/transaction-request.dto';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { ModalFormEvent } from '../../../_enums/modal-form-event';
import { CalculationApiService } from '../../../_api/_runtime/services/calculation-api.service';
import { TransactionType } from '../../../_api/_runtime/enums/transaction-type';
import { TransactionValidationStatus } from '../../../_api/_runtime/enums/transaction-validation-status';
import { AdvancedMathOperator } from '../../../_api/_runtime/enums/advanced-math-operator';

@Component({
  selector: 'cost-adjustment',
  templateUrl: './cost-adjustment.component.html'
})
export class CostAdjustmentComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('costAdjustmentForm', {static: true}) formGroup: FormGroupDirective;
  @Input() modalTitle: string;
  @Input() selectedAsset: AssetDto;
  costAdjustmentDto = <TransactionRequestDto>{};

  newHistorialCost: number;
  newAccumulatedDepreciation: number;

  submitted = false;

  public missingRequiredField: boolean;
  public apiErrorMessage: string;
  public isApiError: boolean;
  public isFiscalYearEndValid: boolean;

  public status: ModalFormEvent;

  constructor(
    public actionsService: QualityControlActionsService,
    public qualityControlService: QualityControlService,
    public calculationService: CalculationApiService,
    public windowManager: WindowManager
  ) {}

  ngOnInit() {
    this.costAdjustmentDto.assets = [this.selectedAsset.id];
    this.costAdjustmentDto.transactionType = TransactionType.Adjustment;
    this.isApiError = false;
    this.qualityControlService.hasFiscalYearEnd().subscribe(res => (this.isFiscalYearEndValid = res));
  }

  handleModalEvent(modalEvent: ModalFormEvent) {
    if (modalEvent === ModalFormEvent.Save) {
      this.formGroup.ngSubmit.emit();
    }

    if (modalEvent === ModalFormEvent.Dismiss) {
      this.dismiss();
    }
  }

  costAdjustment(form: NgForm) {
    this.submitted = true;
    this.isApiError = false;

    if (!this.hasErrors() && form.valid) {
      this.actionsService.processTransaction(this.costAdjustmentDto).subscribe(result => {
        // Get Validation message
        if (result.validationStatus === TransactionValidationStatus.NoErrors) {
          this.isApiError = false;

          this.status = ModalFormEvent.Success;

          this.windowManager.close();
        } else {
          switch (+result.validationStatus) {
            case TransactionValidationStatus.DepGtCost: {
              this.apiErrorMessage = 'Depreciation cannot be greater than adjusted cost.';
              break;
            }
            case TransactionValidationStatus.NegativeCostOrAccumulation: {
              this.apiErrorMessage = 'Cannot create adjustment resulting in negative cost or accumulated depreciation.';
              break;
            }
            case TransactionValidationStatus.HistCostOrAccumDeprCannotBeZero: {
              this.apiErrorMessage = 'Historical Cost or Accumulated Depreciation cannot be zero when Prorate Values is checked.'
              break;
            }
          }
          this.isApiError = true;
        }
      });
    }
  }

  calcCostChange() {
    if (this.newHistorialCost) {
      this.calculationService
        .Calculate(+this.newHistorialCost, +this.selectedAsset.historicalCost, AdvancedMathOperator.Subtract)
        .subscribe(result => {
          this.costAdjustmentDto.costChange = parseFloat(result);
        });
    }
  }

  calcAccumChange() {
    if (this.newAccumulatedDepreciation) {
      this.calculationService
        .Calculate(+this.newAccumulatedDepreciation, +this.selectedAsset.accumulatedDepreciation, AdvancedMathOperator.Subtract)
        .subscribe(result => {
          this.costAdjustmentDto.accumChange = parseFloat(result);
        });
    }
  }

  calcHistoricalCost() {
    this.calculationService
      .Calculate(+this.selectedAsset.historicalCost, +this.costAdjustmentDto.costChange, AdvancedMathOperator.Add)
      .subscribe(result => {
        this.newHistorialCost = parseFloat(result);
      });
  }

  calcNewAccumulatedDepreciation() {
    this.calculationService
      .Calculate(+this.selectedAsset.accumulatedDepreciation, +this.costAdjustmentDto.accumChange, AdvancedMathOperator.Add)
      .subscribe(result => {
        this.newAccumulatedDepreciation = parseFloat(result);
      });
  }

  dismiss() {
    this.windowManager.close();
  }

  hasErrors(): boolean {
    this.missingRequiredField = !this.costAdjustmentDto.costChange && !this.costAdjustmentDto.accumChange;
    return this.missingRequiredField || this.isApiError || !this.isFiscalYearEndValid;
  }
}
