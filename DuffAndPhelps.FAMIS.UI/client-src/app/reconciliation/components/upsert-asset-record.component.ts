import { AlertService } from '../../_core/services/alert.service';
import { NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ReconcileDataGridService } from '../services/reconcile-data-grid.service';

import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { Component, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm, FormGroup } from '@angular/forms';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { ImageEntityType } from '../../_api/_runtime/enums/image-entity-type';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { DataTargetName } from '../../_enums/data-target-name';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';
import { FieldOption } from '../../_models/field-option.model';
import { Asset } from '../../_models/asset.model';
import { AssetFieldInput } from '../../_models/asset-field-input.model';
import { Subscription } from 'rxjs';
import { InventoryService } from '../../_api/services/reconciliation/inventory.service';
import { AssetFileSummaryDto } from '../../_api/dtos/asset-file-summary.dto';
import { WindowOption } from '../../_models/window-option';
import { FormActionEvent } from '../../_models/form-action-event.model';
import { FormAction } from '../../_enums/form-action';
import { FieldMetaDataDto } from '../../_api/dtos/inventory/field-meta-data.dto';
import { FieldType } from '../../_enums/field-type';
import { CascadedSelectValue } from '../../_models/cascaded-select-value.model';

@Component({
  selector: 'upsert-asset-record-component',
  templateUrl: './upsert-asset-record.component.html'
})
export class UpsertAssetRecordComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  imageEntityType: ImageEntityType = ImageEntityType.Asset;

  windowRef: WindowRef;

  constructor(
    private windowManager: WindowManager,
    private alertService: AlertService,
    private inventoryService: InventoryService,
    private reconcileGridService: ReconcileDataGridService,
    private assetFileInfoServie: AssetFileInfoService,
    private canDeactivateService: CanDeactivateService,
  ) {}

  @Input() assetFileSummary: AssetFileSummaryDto;
  @Input() fileType: DataTargetName;
  @Input() groupSiteInfo: Array<CascadedSelectOption>;
  @Input() groupAccounts: Array<FieldOption>;
  @Input() groupDepartments: Array<FieldOption>;

  // Inputs and Outputs
  @ViewChild('content', {static: false}) private content: any;
  @Output() AssetUpsertComplete = new EventEmitter();

  public asset: Asset;

  public isEdit: boolean;
  public formFields: Array<AssetFieldInput>;
  public isSaving = false;

  // Private fields
  private assetForm: NgForm;
  private assetRecordId: string;
  private modalRef: NgbModalRef;
  private options: NgbModalOptions = {
    size: 'lg',
    backdrop: 'static',
    beforeDismiss: () => {
      return this.canDeactivate();
    }
  };
  private toDestroy: Subscription;

  private formSubmitted = false;

  ngOnInit() {}

  ngOnDestroy() {
    if (this.toDestroy) {
      this.toDestroy.unsubscribe();
    }
  }

  openCreateModal(groupId: string, fileType: DataTargetName, duplicateSource?: Asset) {
    // Re-pull asset file summary to account for new fields being added
    this.toDestroy = this.inventoryService.getAssetFileSummary(groupId, fileType).subscribe(
      result => {
        this.assetFileSummary = result;
      },
      error => {},
      () => {
        // Get Form Fields
        this.isSaving = false;
        this.isEdit = false;

        this.asset = duplicateSource ? duplicateSource : <Asset>{};

        this.windowRef = this.windowManager.open(this.content, 'Add Asset Record', <WindowOption>{
          isModal: true,
          translationKey: this.i18n.reconciliation,
          top: -300,
          width: 800
        });
      }
    );
  }

  openEditModal(groupId: string, fileType: DataTargetName, asset: Asset) {
    // Re-pull asset file summary to account for new fields being added
    this.toDestroy = this.inventoryService.getAssetFileSummary(groupId, fileType).subscribe(
      result => {
        this.assetFileSummary = result;
      },
      error => {},
      () => {
        this.isSaving = false;

        this.assetRecordId = asset.assetId;
        this.asset = asset;
        this.assetForm = null;

        this.windowRef = this.windowManager.open(this.content, 'Edit Asset Record', <WindowOption>{
          isModal: true,
          translationKey: this.i18n.reconciliation,
          top: -300,
          width: 800
        });
        this.isEdit = true;
      }
    );
  }

  onFormActionEvent(event: FormActionEvent) {
    switch (event.action) {
      case FormAction.Cancel:
        this.cancel();
        break;
      case FormAction.Save:
        this.assetForm = event.form;
        this.save(event.formGroup);
        break;
      case FormAction.ValueChange:
        this.assetForm = event.form;
        break;
      default:
        throw new Error(`Action ${event.action} not implemented.`);
    }
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateForm(this.assetForm);
  }

  public getFormFields(): FieldMetaDataDto[] {
    const s = this;

    const fields = this.assetFileSummary.fields.filter(function(x) {
      let internalFields = s.assetFileInfoServie.GetInternalColumns();
      // Also filtering out the readonly & special fields that need to be handled differently
      const extraFields: string[] = s.assetFileInfoServie.GetHiddenFields();
      internalFields = internalFields.concat(extraFields);
      return (
        internalFields.findIndex(c => c === x.name) === -1 &&
        x.name !== 'siteIdentifier' &&
        x.name !== 'memberName' &&
        x.name !== 'memberNumber' &&
        x.name !== 'buildingName' &&
        x.name !== 'buildingNumber' &&
        x.name !== 'siteNumber' &&
        x.name !== 'siteName' &&
        x.name !== 'departmentNumber' &&
        x.name !== 'accountDescription'
      );
    });

    const buildingSelection = <FieldMetaDataDto>{
      fieldType: FieldType.CascadingComboBox,
      displayName: 'Member',
      name: 'buildingId',
      cascadedValues: [
        <CascadedSelectValue>{ displayName: 'Member', name: 'member' },
        <CascadedSelectValue>{ displayName: 'Site', name: 'siteId' },
        <CascadedSelectValue>{ displayName: 'Building', name: 'buildingId' }
      ],
      cascadedValueOptions: this.groupSiteInfo,
      required: true
    };

    fields.push(buildingSelection);

    const departmentSelection = <FieldMetaDataDto>{
      fieldType: FieldType.DropDown,
      displayName: 'Department',
      name: 'departmentId',
      options: this.groupDepartments,
    };
    fields.push(departmentSelection);

    const accountSelections = <FieldMetaDataDto>{
      fieldType: FieldType.DropDown,
      displayName: 'Account',
      name: 'accountId',
      options: this.groupAccounts,
    };
    fields.push(accountSelections);

    const nonTranslatedFields = this.assetFileInfoServie.GetNonTranslatedFields();

      fields.forEach(field => {
          if (nonTranslatedFields.findIndex(x => x === field.name) === -1) {
            field.translationKey = this.i18n.asset;
          } else {
            field.translationKey = this.i18n.noTranslate;
          }
        });

    return this.fileType === DataTargetName.client ? fields.filter(c => c.isCustom === true) : fields;
  }

  private save(formGroup: FormGroup): void {
    if (this.isEdit) {
      // update Record

      const assetDto = formGroup.value;

      if (assetDto.buildingId) {
        assetDto.buildingId = assetDto.buildingId.split(',')[2];
      }

      assetDto['id'] = this.assetRecordId;

      delete assetDto['property'];

      this.inventoryService.updateAssetRecord(this.assetRecordId, assetDto).subscribe(
        result => {
          this.reconcileGridService.updateCachedRecord(result, this.fileType).subscribe(res => {
            this.alertService.success('Asset record updated.');
            this.formSubmitted = true;
            this.AssetUpsertComplete.emit();
            this.windowManager.close();
          });
        },
        error => {
          this.windowManager.close();
        },
        () => {
          this.windowManager.close();
        }
      );
    } else {
      // Create Record
      this.inventoryService.createAssetRecord(this.assetFileSummary.id, formGroup.value).subscribe(
        result => {
          // Map to ui model and add AssetId
          this.reconcileGridService.createCachedRecord(result, this.fileType).subscribe(() => {
            this.AssetUpsertComplete.emit();
            this.alertService.success('Asset record created');
            this.windowManager.close();
          });
        },
        error => {
          this.windowManager.close();
        },
        () => {
          this.windowManager.close();
        }
      );
    }
  }

  private cancel(): void {
    if (this.canDeactivate()) {
      this.windowManager.close();
    }
  }
}
