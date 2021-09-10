import { QualityControlService } from '../../../services/quality-control.service';
import { AlertService } from '../../../../_core/services/alert.service';
import { AssetFileInfoService } from '../../../../_core/services/asset-file-info-service';
import { ComponentCanDeactivate } from '../../../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { FieldMetaDataDto } from '../../../../_api/dtos/inventory/field-meta-data.dto';
import { ImageEntityType } from '../../../../_api/_runtime/enums/image-entity-type';
import { AssetDto } from '../../../../_api/_runtime/dtos/asset.dto';
import { CascadedSelectOption } from '../../../../_models/cascaded-select-option.model';
import { FieldOption } from '../../../../_models/field-option.model';
import { AssetFileSummaryDto } from '../../../../_api/dtos/asset-file-summary.dto';
import { BreadCrumb } from '../../../../_models/breadcrumbs.model';
import { NgForm, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InventoryApiService } from '../../../../_api/_runtime/services/inventory-api.service';
import { FieldType } from '../../../../_enums/field-type';
import { CascadedSelectValue } from '../../../../_models/cascaded-select-value.model';
import { FormActionEvent } from '../../../../_models/form-action-event.model';
import { FormAction } from '../../../../_enums/form-action';

@Component({
  selector: 'view-content',
  templateUrl: './view-content.component.html'
})
export class ViewContentComponent extends ComponentCanDeactivate implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  fields = new Array<FieldMetaDataDto>();
  imageEntityType: ImageEntityType = ImageEntityType.Asset;

  assetDto: AssetDto;

  contentId: string;
  groupId: string = this.qualityControlService.groupId;
  fileType: string;

  formModels = [];

  fieldsArray: Array<AssetDto | FieldMetaDataDto>;

  groupSiteInfo: Array<CascadedSelectOption>;
  groupAccounts: Array<FieldOption>;
  groupDepartments: Array<FieldOption>;

  assetFileSummary = <AssetFileSummaryDto>{};

  keepFormOpen: boolean;


  breadCrumbs = [
    <BreadCrumb>{ name: 'Quality Control Overview', routerLink: '../../' },
    <BreadCrumb>{ name: 'Edit Content', routerLink: 'EditContent', isDisabled: true }
  ];

  private formInProgress: NgForm;

  constructor(
    private qualityControlService: QualityControlService,
    private assetFileInfoService: AssetFileInfoService,
    private router: Router,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private inventoryServiceRuntime: InventoryApiService,
    private canDeactivateService: CanDeactivateService
  ) {
    super();
  }

  ngOnInit() {
    const s = this;
    const contentId = this.route.snapshot.paramMap.get('contentId');

    if (contentId) {
      this.contentId = contentId;
      this.inventoryServiceRuntime.getAssetRecord(contentId).subscribe(assetDto => {
        this.assetDto = assetDto;
        this.fields = this.qualityControlService.assetFileSummary.fields.filter(function(x) {
          const internalFields = s.assetFileInfoService.GetInternalColumns();
          return (internalFields.findIndex(c => c === x.name) === -1 &&
            x.name !== 'siteIdentifier' &&
            x.name !== 'activityCode' &&
            x.name !== 'memberName' &&
            x.name !== 'memberNumber' &&
            x.name !== 'buildingName' &&
            x.name !== 'buildingNumber' &&
            x.name !== 'siteNumber' &&
            x.name !== 'siteName' &&
            x.name !== 'departmentNumber' &&
            x.name !== 'accountNumber' &&
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
          cascadedValueOptions: this.qualityControlService.buildingSelectionOptions,
          required: true
        };

        s.fields.push(buildingSelection);

        const departmentSelection = <FieldMetaDataDto>{
          fieldType: FieldType.DropDown,
          displayName: 'Department Name',
          name: 'departmentId',
          options: this.qualityControlService.groupDepartmentOptions
        };

        s.fields.push(departmentSelection);

        const accountSelections = <FieldMetaDataDto>{
          fieldType: FieldType.DropDown,
          displayName: 'Account Description',
          name: 'accountId',
          options: this.qualityControlService.accountOptions
        };
        s.fields.push(accountSelections);

        const activityCodeSelections = <FieldMetaDataDto>{
          fieldType: FieldType.DropDown,
          displayName: 'ActivityCode',
          name: 'activityCode',
          options: this.qualityControlService.activityCodeOptions
        };
        s.fields.push(activityCodeSelections);

        const nonTranslatedFields = this.assetFileInfoService.GetNonTranslatedFields();

        s.fields.forEach(field => {
          if (nonTranslatedFields.findIndex(x => x === field.name) === -1) {
            field.translationKey = this.i18n.asset;
          } else {
            field.translationKey = this.i18n.noTranslate;
          }
        });
      });
    }
  }

  onFormActionEvent(event: FormActionEvent) {
    switch (event.action) {
      case FormAction.Cancel:
        this.cancel();
        break;
      case FormAction.Save:
        this.keepFormOpen = false;
        this.save(event.formGroup, event.dto);
        break;
      case FormAction.ValueChange:
        this.formInProgress = event.form;
        break;
        case FormAction.KeepOpen:
        this.keepFormOpen = true;
        this.save(event.formGroup, event.dto);
        break;
      default:
        throw new Error(`Action ${event.action} not implemented.`);
    }
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateForm(this.formInProgress);
  }

  private save(form: FormGroup, assetDto: AssetDto): void {
    if (form.valid) {
      assetDto.id = this.contentId;
      this.inventoryServiceRuntime.updateAssetRecord(this.contentId, assetDto).subscribe(
        () => {
          this.alertService.success('Content edit successfully');
          if (!this.keepFormOpen) {
            this.formInProgress = null;
            this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`], { queryParams: { mode: 0 } });
          } 
        },
        error => {
          this.alertService.error('An error has occurred saving this content');
        },
        () => {}
      );
    } else {
      this.alertService.error('Missing required fields');
    }
  }

  private cancel(): void {
    this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`], { queryParams: { mode: 0 } });
  }
}
