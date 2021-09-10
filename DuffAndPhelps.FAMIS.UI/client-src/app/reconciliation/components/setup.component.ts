import { AlertService } from '../../_core/services/alert.service';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Group } from '../../_models/group';
import { MatchCode } from '../../_models/match-code.model';
import { AssetFieldDto } from '../../_api/dtos/asset-field.dto';
import { CostFieldsService } from '../../_api/services/reconciliation/cost-fields.service';
import { MatchCodesService } from '../../_api/services/reconciliation/match-codes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'setup',
  templateUrl: './setup.component.html'
})
export class SetupComponent extends ComponentCanDeactivate  implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('dataImportForm', {static: false}) currentForm: NgForm;

  selectedGroupToCopyFrom: Group;
  selectedMatchCodes: MatchCode[] = [];
  selectedMatchCodeIds = new Array<string>();
  costFields: Array<AssetFieldDto>;
  selectedCostField: string;
  success: boolean;
  pendingChanges: boolean;

  private selectedGroupId: string;

  public isBusy = false;

  constructor(
    private costFieldsService: CostFieldsService,
    private matchCodeService: MatchCodesService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private reconcileDataService: ReconcileDataService,
    private canDeactivateService: CanDeactivateService
  ) {
    super();
  }

  ngOnInit() {
    this.pendingChanges = false;
    this.selectedGroupId = this.reconcileDataService.groupId;

    this.costFieldsService.getTemplates().subscribe(templates => {
      const templateId = templates.find(c => c.name === 'Client Inventory');

      if (templateId) {
        this.costFieldsService
          .getCostFields(templateId.id)
          .subscribe(result => {
            if (result == null) {
              return;
            }
            this.costFields = result.importTemplateColumns
              .filter(c => c.destinationColumnName === 'HistoricalCost')
              .map(field => new AssetFieldDto(field.name, field.destinationColumnName));

            const historicalCostObj = this.costFields.find(field => field.value === 'HistoricalCost');

            if (Object.keys(historicalCostObj).length) {
              this.selectedCostField = historicalCostObj.value;
            } else {
              this.costFieldsService
                .getGroupCostField(this.selectedGroupId)
                .subscribe(assetAllocationField => {
                  if (assetAllocationField != null) {
                    this.selectedCostField = assetAllocationField.assetFileField;
                  }
              });
            }
          });
      }
    });
  }

  onSubmit(form) {
    this.pendingChanges = false;
    // console.log(this.selectedCostField);
    this.isBusy = true;
    this.costFieldsService
      .saveCostField(this.selectedGroupId, this.selectedCostField)
      .subscribe(err => console.log(err));

    this.matchCodeService
      .saveGroupMatchCodesSelection(
      this.selectedGroupId,
      this.selectedMatchCodes
      )
      .subscribe(
      result => {
        this.router.navigate(['./reconcile-data'], {
          relativeTo: this.route.parent
        });
        this.isBusy = false;
      }
      );
  }

  handleMatchCodes(emittedCustomFields: Array<any>) {
    this.selectedMatchCodes = emittedCustomFields;
    this.pendingChanges = true;
  }
  handleMatchCodesLoaded(codes: Array<any>) {
    const getGroupMatchCodesSelection = this.matchCodeService.getGroupMatchCodesSelection(this.selectedGroupId);
    const getGroupMatchCodes = this.matchCodeService.getGroupMatchCodes(this.selectedGroupId);
    forkJoin(getGroupMatchCodesSelection, getGroupMatchCodes)
    .subscribe(
      ([matchCodeSelection, groupMatchCodes]) => {
        if (matchCodeSelection != null) {
          matchCodeSelection.forEach(id => {
              if (this.isMatchCodeEnabled(id)) {
                this.selectedMatchCodeIds.push(id);
              }
            });
          }
          if (groupMatchCodes.length > 0) {
            this.setupMatchCodeSelection();
          }
      }
    );
  }

  onGroupSelected(group: Group) {
    this.selectedGroupToCopyFrom = group;
    this.matchCodeService
      .getGroupMatchCodesSelection(group.id)
      .subscribe(ids => {
        let addedCount = 0;
        ids.forEach(id => {
          const index = this.selectedMatchCodeIds.findIndex(s => s === id);
          if (index === -1 && this.isMatchCodeEnabled(id)) {

            this.selectedMatchCodeIds.push(id);
            addedCount++;
          }
        });
        if (addedCount > 0) {
          this.setupMatchCodeSelection();
          this.alertService.success('Successfully selected {{addedCount}} additional match codes.', null, {addedCount: addedCount});
        } else {
          this.alertService.success('No additional match codes added.');
        }
      });
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateFormAndComponent(this.currentForm, this.pendingChanges);
  }

  private isMatchCodeEnabled(id: string): boolean {
    const matchCode = this.matchCodeService.cachedMatchCodes.find(mc => mc.id === id);
    return (matchCode != null && matchCode.isEnabled);
  }

  setupMatchCodeSelection() {
    // Deselect all matchcodes first
    this.matchCodeService.cachedMatchCodes.forEach(m => {
      m.isSelected = false;
    });
    this.selectedMatchCodes = [];
    this.selectedMatchCodeIds.forEach(m => {
      const matchCode = this.matchCodeService.cachedMatchCodes.find(x => x.id === m);
      matchCode.isSelected = true;
      this.selectedMatchCodes.push(matchCode);
    });
  }
}
