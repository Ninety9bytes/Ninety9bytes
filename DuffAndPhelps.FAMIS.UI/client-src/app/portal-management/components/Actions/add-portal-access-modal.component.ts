import { AlertService } from '../../../_core/services/alert.service';
import { PortalManagementService } from '../../services/portal-management.service';
import { NgbActiveModal, NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { FormGroupDirective, NgForm } from '@angular/forms';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { of, Observable } from 'rxjs';
import { catchError, tap, merge, switchMap, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { ModalFormEvent } from '../../../_enums/modal-form-event';
import { ContractSearchResultDto } from '../../../_api/_runtime/dtos/contract-search-result.dto';
import { GroupDto } from '../../../_api/_runtime/dtos/group.dto';

@Component({
  selector: 'add-portal-access-modal',
  templateUrl: './add-portal-access-modal.component.html'
})
export class AddPortalAccessComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @ViewChild('portalGroupForm', { static: true }) formGroup: FormGroupDirective;
  @Input() modalTitle: string;

  public selectedContractId: string;
  public displayErrors = false;
  public contractExists = false;
  public apiError = '';
  public submitResponse: ModalFormEvent;
  public accounts: GroupDto[] = [];
  public selectedAccountId: string;

  model: ContractSearchResultDto;
  searching = false;
  searchFailed = false;
  item: NgbTypeaheadSelectItemEvent = null;
  hideSearchingWhenUnsubscribed = new Observable(() => () => (this.searching = false));

  constructor(private portalService: PortalManagementService, private windowManager: WindowManager, private alertService: AlertService) {}

  ngOnInit() {  }

  handleModalEvent(modalEvent: ModalFormEvent) {
    if (modalEvent === ModalFormEvent.Save) {
      this.formGroup.ngSubmit.emit();
    }

    if (modalEvent === ModalFormEvent.Dismiss) {
      this.dismiss();
    }
  }

  dismiss() {
    this.windowManager.close();
  }

  addPortalGroup(form: NgForm) {
    this.displayErrors = false;
    if (form.valid) {
      //appending '-Portal' to portal groupname, refer BUG-18546
      let account = this.accounts.find(acc => acc.id === this.selectedAccountId);
      this.portalService.createPortalGroup(this.selectedContractId, account.groupName + '-Portal', account.id).subscribe(result => {
        if (result) {
          this.submitResponse = ModalFormEvent.Success;
          this.windowManager.close();
        } else {
          this.submitResponse = ModalFormEvent.Failed;
          this.alertService.error('Failed to create portal account.');
          this.windowManager.close();
        }
      },
      error => {
        this.apiError = !!error.error ? error.error : 'An unknown error has occurred';
        this.contractExists = true;
      }
      );
    } else {
      this.displayErrors = true;
    }
  }

  public getResultFormatter(result) {
    return result.projectCode + ' (' + result.contractName + ')';
  }

  public getInputFormatter(result) {
    return result.projectCode + ' (' + result.contractName + ')';
  }

  onSelectItem(selected: NgbTypeaheadSelectItemEvent): void {
    this.selectedContractId = selected.item.id;
    this.portalService.getContractGroups(this.selectedContractId).subscribe(result => {
      if(result && result.length > 0) {
        this.accounts = result;
      } else {
        this.accounts = [];
      }
    });

  }

  search = (text$: Observable<string>) =>
    text$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(tap(() => (this.searching = true)))
      .pipe(switchMap(term =>
        this.portalService
          .searchPortalContracts(term)
          .pipe(tap(() => {
            this.searchFailed = false;
          }))
          .pipe(catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ))
      .pipe(tap(() => {
        this.searching = false;
      }))
      .pipe(merge(this.hideSearchingWhenUnsubscribed))
}
