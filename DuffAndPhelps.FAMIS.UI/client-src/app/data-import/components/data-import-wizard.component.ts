import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { WizardService } from '../../_ui/services/wizard.service';
import { ActivatedRoute } from '@angular/router';
import { GroupSearchService } from '../../_api/services/group-search.service';
import { ContractService } from '../../_api/services/dashboard/contract.service';

@Component({
  selector: 'app-data-import',
  templateUrl: './data-import-wizard.component.html'
})
export class DataImportWizardComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private destroyed$ = new Subject<any>();

  public activeTab: any;
  contractId: string;
  groupId: string;
  isLoading: boolean;
  canDataImport: boolean;
  errorMessage: string;

  @ViewChild('tabs', { static: false }) private tabs: NgbTabset;

  constructor(
    private wizardService: WizardService,
    private route: ActivatedRoute,
    private dataImportService: DataImportService,
    private contractService: ContractService,
    private groupService: GroupSearchService
  ) {
    // subscribe to home component messages
    this.wizardService.activeTab$.pipe(takeUntil(this.destroyed$)).subscribe(activeTab => {
      this.activeTab = activeTab;
      this.wizardService.activeTabs.push(activeTab);
      if (this.tabs) {
        // Setting timeout to wait for tab to be set to enabled
        setTimeout(() => {
          //
          this.tabs.select(activeTab);
        }, 100);
      }
    });
  }

  ngOnInit() {
    this.isLoading = true;
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.groupService
      .getContractGroup(this.groupId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        result => {
          this.contractId = result.contractId;

          this.contractService
            .getContractGroupsByGroupId(this.contractId, this.groupId)
            .pipe(takeUntil(this.destroyed$))
            .subscribe(
              contractGroups => {

                this.dataImportService.dataImportHistory = contractGroups[0].recordCounts.length ? true : false;

                if (contractGroups[0].reconciliationProgress.toLowerCase() === 'notstarted') {
                  this.dataImportService.importAfterReconciliation = false;
                  this.dataImportService.reconciliationStarted = false;
                }else if (contractGroups[0].reconciliationProgress.toLowerCase() === 'started') {
                  this.dataImportService.reconciliationStarted = true;
                }else if (contractGroups[0].reconciliationProgress.toLowerCase() === 'completed') {
                  this.dataImportService.importAfterReconciliation = true;
                  this.dataImportService.reconciliationCompleted = true;

                }
                this.canDataImport = true;
                this.isLoading = false;
              },
              error => {
                this.errorMessage = 'Error determining reconciliation status, please try again later.';
                this.isLoading = false;
                this.canDataImport = false;
              }
            );
        },
        error => {
          this.errorMessage = 'Error loading group, please try again.';
          this.isLoading = false;
          this.canDataImport = false;
        }
      );
  }

  public isActive(id) {
    return this.wizardService.activeTabs.indexOf(id) === -1;
  }

  ngOnDestroy() {
    this.destroyed$.next();
    // console.log('import wizard destoryed');
  }
}
