import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { AlertService } from '../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { TransactionSummaryFieldDto } from '../../../_api/_runtime/dtos/transaction-revert-summary-current.dto';
import { TransactionAssetSummaryDto } from '../../../_api/_runtime/dtos/transaction-revert-summary.dto';

@Component({
  selector: 'revert',
  templateUrl: './revert.component.html'
})

export class RevertComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Output() submitSuccess = new EventEmitter<boolean>();

  private destroyed$ = new Subject<any>();

  public headers = Array<TransactionSummaryFieldDto>();
  public currentTransaction = Array<TransactionAssetSummaryDto>();
  public previousTransaction = Array<TransactionAssetSummaryDto>();
  public transactionId: string;
  public transactionType: string;
  public assetTagNumber: string;

  public isLoading: Subscription;
  public minColWidth = 150;
  constructor(
    public activeModal: NgbActiveModal,
    private transactionsService: TransactionsService,
    private alertService: AlertService,
    private windowManager: WindowManager,
    private router: Router
  ) { }

  ngOnInit() {
    this.isLoading = this.transactionsService.getRevertSummary(this.transactionId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe((revertSummary) => {
        this.transactionType = revertSummary.transactionType;

        revertSummary.headers.forEach(header => this.createMappingForKendoGrid(header));
        this.currentTransaction = revertSummary.current;
        this.previousTransaction.push(revertSummary.previous);
    });
  }

  private createMappingForKendoGrid(header: TransactionSummaryFieldDto) {
    header.name = header.name.toLowerCase().charAt(0) + header.name.slice(1);
    header.source = header.source !== null
      ? header.source.toLowerCase().charAt(0) + header.source.slice(1)
      : header.name;

    this.headers.push(header);
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSubmit() {
    this.transactionsService.revertTransaction(this.transactionId)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          this.alertService.success('Transaction successfully Reverted.');
          this.submitSuccess.emit(true);
          this.closeModalEvent();
        },
        error => {
          this.alertService.error('An error has occurred reverting the transaction.');
          this.closeModalEvent();
          this.router.navigate([`error/409`]);
        },
        () => { }
  );
  }

  public closeModalEvent() {
    this.windowManager.close();
  }
}
