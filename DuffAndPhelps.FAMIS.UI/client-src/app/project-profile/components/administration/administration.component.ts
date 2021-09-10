import { ConfirmModalComponent } from '../../../_shared/components/confirm-modal.component';
import { AlertService } from '../../../_core/services/alert.service';
import { NgForm } from '@angular/forms';
import { AdministrationService } from '../../services/administration.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { ContractsGroupSummaryDto } from '../../../_api/dtos/shared/contracts-groups-summary.dto';
import { DataTargetName } from '../../../_enums/data-target-name';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../_api/services/dashboard/contract.service';
import { GroupSearchService } from '../../../_api/services/group-search.service';
import { ReconciliationMatchService } from '../../../_api/services/reconciliation/reconcilation-match.service';
import { ModalProperties } from '../../../_models/modal-properties.model';
import { InventoryService } from '../../../_api/services/reconciliation/inventory.service';

@Component({
  selector: 'administration',
  templateUrl: './administration.component.html'
})
export class AdministrationComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  selectedAction: string;
  assetRecord: ContractsGroupSummaryDto;
  consolidatedCount: Number;
  contractId: string;
  groupId: string;
  dataTarget: DataTargetName = DataTargetName.consolidated;

  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private inventoryService: InventoryService,
    private groupService: GroupSearchService,
    private alertService: AlertService,
    private administrationService: AdministrationService,
    private router: Router,
    private translateService: TranslateService,
    private reconciliationMatchService: ReconciliationMatchService,
    ) { }

  ngOnInit() {
   // console.log(this.administrationService.groupId);
    this.groupId = this.administrationService.groupId;

    this.groupService.getContractGroup(this.groupId).subscribe(
      result => {
        this.contractId = result.contractId;
      },
      error => {
        // TODO: Something more meaningful than nothing to handle the error
      });

  }

  onSubmit(form) {

    if (form.valid) {
      switch (this.selectedAction) {
        case 'DeleteReconciledData':
          this.contractService.getContractGroupsByGroupId(this.contractId, this.groupId).subscribe(result => {
            this.assetRecord = result;
            const hasMatchData = result[0].reconciliationProgress.toLowerCase() !== 'notstarted';
            this.deleteReconciledData(form, hasMatchData);
          });

          break;
        case 'RollbackConsolidatedFile':
          this.contractService.getContractGroupsByGroupId(this.contractId, this.groupId).subscribe(result => {
            this.assetRecord = result;
            this.rollbackConsolidatedFile(form);
          });
          break;
        case 'RollbackTransactionData':
          this.navigateToTransaction();
          break;
        case 'GroupSave' :
        // console.log('groupsave');
          this.navigateToGroupSaves();
          break;
          case 'DeactivateItems' :
        // console.log('groupsave');
          this.navigateToRemoveDeactivated();
          break;
        default:
          // Logically we should never get here thanks to error handling on the submit
          this.alertService.error('Please select an admin action.');
      }
    }

  }

  private deleteReconciledData(form: NgForm, hasMatchData: boolean) {
    this.consolidatedCount = this.assetRecord[0].recordCounts.filter(r => r.type === DataTargetName.consolidated)[0].count;

    if (hasMatchData) {

      // Open modal
      const modal = this.modalService.open(ConfirmModalComponent);
      modal.componentInstance.options = <ModalProperties> {
        heading: {
          key: 'Delete Reconciled Data'
        },
        body: {
          key: 'Are you sure you wish to remove all record matches and delete {{consolidatedCount}} consolidated records?',
          params: {consolidatedCount: this.consolidatedCount},
        },
        dismissText: {
          key: 'Cancel'
        },
        successText: {
          key: 'Continue'
        },
        translateBaseKey: this.i18n.common
      };

      // Check modal result
      modal.result.then(
        result => {
          this.reconciliationMatchService.deleteGroupReconciliationData(this.groupId).subscribe(() => {
            this.alertService.success('Reconciled data successfully deleted.');
            this.resetForm(form);
          }, error => {
            this.alertService.error('Error deleting reconciled data, please try again.');
            this.resetForm(form);
          });
        },
        error => {
          // Cancel/dismiss -- not nothing? Close modal, reset select?
         // console.log(error);
          this.resetForm(form);
        });
    } else {
      this.alertService.info('No reconciliation matches have been found.');
      this.resetForm(form);
    }

  }

  private rollbackConsolidatedFile(form: NgForm) {
    this.consolidatedCount = this.assetRecord[0].recordCounts.filter(r => r.type === DataTargetName.consolidated)[0].count;

    if (this.consolidatedCount > 0) {
      // Open modal
      const modal = this.modalService.open(ConfirmModalComponent);
      modal.componentInstance.options = <ModalProperties> {
        heading: {
          key: 'Delete Consolidated Data'
        },
        body: {
          key: 'Are you sure you wish to delete {{consolidatedCount}} records?',
          params: {consolidatedCount: this.consolidatedCount},
        },
        dismissText: {
          key: 'Cancel'
        },
        successText: {
          key: 'Continue'
        },
        translateBaseKey: this.i18n.common
      };

      // Check modal result
      modal.result.then(
        result => {
          this.inventoryService.deleteAssetFileForGroup(this.groupId, this.dataTarget).subscribe(() => {
            this.alertService.success('Reconciled data successfully deleted.');
            this.resetForm(form);
          }, error => {
            this.alertService.error('Error deleting reconciled data, please try again.');
            this.resetForm(form);
          });
        },
        error => {
          // Cancel/dismiss -- not nothing? Close modal, reset select?
         // console.log(error);
          this.resetForm(form);
        });
    } else {
      this.alertService.info('No reconciled data present to delete.');
      this.resetForm(form);
    }
  }

  private navigateToTransaction() {
    this.router.navigate([`/project-profile/${this.groupId}/Administration/Transactions`]);
  }

  private navigateToGroupSaves() {
    this.router.navigate([`/project-profile/${this.groupId}/group-save`]);
  }
   private navigateToRemoveDeactivated() {
    this.router.navigate([`/project-profile/${this.groupId}/remove-deactivated`]);
  }
  private resetForm(form: NgForm) {

    this.selectedAction = '';
    form.resetForm();

  }

}
