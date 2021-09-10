import { AlertService } from '../../_core/services/alert.service';
import { ConsolidationService } from '../services/consolidation.service';
import { HelperService } from '../../_core/services/helper.service';
import { ReconcileDataService } from '../services/reconcile-data.service';

import { ReconciliationValidationComponent } from './reconciliation-validation.component';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { ReconciliationInventoryService } from '../services/inventory.service';
import { InventoryService } from '../../_api/services/reconciliation/inventory.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { Component, ViewChild, OnDestroy, OnInit } from '@angular/core';
import { ConsolidatedFilePreviewDto } from '../../_api/dtos/consolidated-file-preview.dto';
import { Subscription, Subject, forkJoin } from 'rxjs';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { IntlService } from '@progress/kendo-angular-intl';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTargetName } from '../../_enums/data-target-name';

@Component({
  selector: 'finalze-data',
  templateUrl: './finalize-data.component.html'
})
export class FinalizeDataComponent implements OnDestroy, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public showValidationErrors: boolean;
  responseData: Array<ConsolidatedFilePreviewDto>;
  groupId: string;
  public loading: Subscription;
  public isBusy = false;
  public headers: GridColumnHeader[];

  @ViewChild(ReconciliationValidationComponent, {static: false}) reconciliationValidationComponent: ReconciliationValidationComponent;

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  constructor(
    public intl: IntlService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private helperService: HelperService,
    private consolidationService: ConsolidationService,
    private inventoryApiService: InventoryService,
    private reconcileDataService: ReconcileDataService,
    private assetFileInfoService: AssetFileInfoService,
    private inventoryService: ReconciliationInventoryService,
    private translateManager: TranslationManager,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.groupId = this.reconcileDataService.groupId;
    this.showValidationErrors = false;
    this.consolidationService.initialize(this.groupId);

    // Init form fields
      this.inventoryApiService.getConsolidatedFilePreview(this.groupId, true).subscribe(consolidatedPreview => {
        this.inventoryService.getSearchMetadataByGroupId(this.groupId, DataTargetName.consolidated)
        .subscribe((searchMetadata) => {
          this.responseData = consolidatedPreview.result;
          this.headers = this.helperService
            .mapHeaders(searchMetadata.fields, this.assetFileInfoService.GetInternalColumns())
            .filter(x =>
              consolidatedPreview.result[0].columnProperties.find(
                c => this.helperService.lowerCasePropertyName(c.destinationColumnName) ===
                  this.helperService.lowerCasePropertyName(x.name)
              )
            );
        },
        error => {
          this.alertService.error(error.error ? error.error : 'An unknown error occurred generating preview');
        }
        );
      });

  }

  ngOnDestroy() {
    if (this.loading) {
      this.loading.unsubscribe();
    }

    this.destroyed$.next();
  }

  getHeaders(row: any) {
    const headers = {};
    row.forEach(element => {
      headers[this.helperService.lowerCasePropertyName(element.destinationColumnName)] = null;
    });

    return this.helperService.getHeaders(headers, this.assetFileInfoService.GetInternalColumns());
  }

  generateColumnArrayData(obj) {
    return Object.keys(obj).map(key => {
      return { key: key, value: obj[key] };
    });
  }

  onBack(event: any) {
    this.router.navigate(['./map-matchcodes'], {
      relativeTo: this.route.parent
    });
  }

  onSave(event: any) {
    this.alertService.success('Reconciliation data saved successfully.', true);
    this.router.navigate([`/project-profile/${this.groupId}/MainProfile`]);
  }

  onContinue(event: any) {
    event.preventDefault();
    this.isBusy = true;

    this.reconcileDataService.validateReconciliation(false).subscribe(result => {
      if (result.isReconciliationComplete && !result.isConsolidatedFileCreated) {
        this.showValidationErrors = false;
        this.inventoryApiService.createConsolidatedFile(this.groupId).subscribe(
          consolidationResult => {
            this.alertService.success('Consolidated file successfully created.', true);
            this.router.navigate([`/project-profile/${this.groupId}/MainProfile`]);
          },
          error => {
            this.alertService.error(error.error ? error.error : 'An unknown error occurred creating consolidated file');
          },
          () => {
            this.isBusy = false;
          }
        );
      } else {
        this.showValidationErrors = true;
        this.reconciliationValidationComponent.resolveErrorsToCommit = true;
        this.reconciliationValidationComponent.open();
        this.isBusy = false;
      }
    });
  }

  public getColumnTitle(column: GridColumnHeader): string {
    if (!column.isCustom) {
      return this.translateManager.instant(this.i18n.asset + column.displayName);
    }

    return column.displayName;
  }

  upperCasePropertyName(fieldName: string) {
    return this.helperService.upperCasePropertyName(fieldName);
  }
}
