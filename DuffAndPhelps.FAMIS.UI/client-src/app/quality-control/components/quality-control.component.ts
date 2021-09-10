import { QualityControlService } from '../services/quality-control.service';
import { BuildingInfoService } from '../../_core/services/building-info-service';
import { ReconciliationInventoryService } from '../../reconciliation/services/inventory.service';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { AlertService } from '../../_core/services/alert.service';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { NgForm } from '@angular/forms';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { DataItemValue } from '../../_models/data-item-value.model';
import { ActivatedRoute, Router } from '@angular/router';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { FieldOption } from '../../_models/field-option.model';

@Component({
  selector: 'quality-control',
  templateUrl: './quality-control.component.html'
})
export class QualityControlComponent extends ComponentCanDeactivate implements OnInit, OnDestroy, TranslatedComponent {

  i18n = TranslationBaseKeys;
  dataTarget: number;
  isLoading = true;

  private destroyed$ = new Subject<any>();

  private form: NgForm;

  private editedRecords = new Array<DataItemValue>();


  constructor(
    private qualityControlService: QualityControlService,
    private route: ActivatedRoute,
    private inventoryServiceRuntime: InventoryApiService,
    private buildingInfoService: BuildingInfoService,
    private inventoryService: ReconciliationInventoryService,
    private assetFileInfoService: AssetFileInfoService,
    private router: Router,
    private alertService: AlertService,
    private canDeactivateService: CanDeactivateService,
    private famisGridservice: FamisGridService
  ) {
    super();
  }

  ngOnInit() {



    this.famisGridservice.editedRecords$.subscribe(editedRecords => {

      this.editedRecords = editedRecords;

    });

    this.qualityControlService.groupId = this.route.parent.snapshot.paramMap.get('groupId');

    // API querys
    this.qualityControlService.getStatus(this.qualityControlService.groupId).subscribe(status => {
      if (status) {
        this.qualityControlService.statisExists = status.exists;

        if (status.exists) {
          this.qualityControlService.status = status;

          this.inventoryServiceRuntime
            .getSearchMetadataByGroupId(this.qualityControlService.groupId, status.dataTarget)
            .subscribe(assetFileSummary => {
              this.qualityControlService.assetFileSummary = assetFileSummary;
            });
        }
      }

      const getActivityCodes = this.qualityControlService.getActivityCodes();
      const getDepreciationConventions = this.qualityControlService.getDepreciationConventions();
      const getDepreciationMethods = this.qualityControlService.getDepreciationMethods();
      const getBuildingHierarchy = this.buildingInfoService.getBuildingHierarchyByGroupId(this.qualityControlService.groupId);
      const getGroupDepartmentOptions = this.inventoryService.getGroupDepartmentsOptions(this.qualityControlService.groupId);
      const getAccountData = this.qualityControlService.getAccountData(this.qualityControlService.groupId);

      forkJoin(getActivityCodes, getBuildingHierarchy, getGroupDepartmentOptions, getAccountData, getDepreciationConventions, getDepreciationMethods)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(
          ([activityCodes, buildingHierarchy, groupDepartmentOptions, accountData, depreciationConventions, depreciationMethods]) => {
            if (activityCodes && buildingHierarchy && groupDepartmentOptions && accountData && depreciationConventions && depreciationMethods) {
              this.qualityControlService.buildingSelectionOptions = this.buildingInfoService.mapSitesToSelectOptions(buildingHierarchy);
              this.qualityControlService.groupDepartmentOptions = groupDepartmentOptions;

              this.qualityControlService.activityCodeOptions = this.assetFileInfoService.mapEnumResult(
                activityCodes.result.enumOptions
              );

              this.qualityControlService.depreciationConventionOptions = this.assetFileInfoService.mapEnumResult(
                depreciationConventions.result.enumOptions
              );

              this.qualityControlService.depreciationMethodOptions = this.assetFileInfoService.mapEnumResult(
                depreciationMethods.result.enumOptions
              );

              if (!this.qualityControlService.accountOptions) {
                this.qualityControlService.accountOptions = new Array<FieldOption>();

                accountData.forEach(account => {
                  this.qualityControlService.accountOptions.push(
                    <FieldOption>{ key: account.id, displayName: account.accountDescription });
                });
              }
            }
          },
          error => {
            this.alertService.error('An error has occurred');
          }
        );

      this.dataTarget = status.dataTarget;

      this.qualityControlService.dataTarget = status.dataTarget;

      this.isLoading = false;
    });
  }

  ngOnDestroy() {}

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateForm(null, this.editedRecords.length > 0);
  }

  navigateToImportData(event: any): void {
    event.preventDefault();
    this.router.navigate([`project-profile/${this.qualityControlService.groupId}/DataImport`]);
  }

  hasRequiredData() {
    const hasRequiredData =
      !!this.qualityControlService.buildingSelectionOptions &&
      !!this.qualityControlService.groupDepartmentOptions &&
      !!this.qualityControlService.accountOptions &&
      !!this.qualityControlService.activityCodeOptions &&
      !!this.qualityControlService.depreciationConventionOptions;

    return hasRequiredData;
  }
}
