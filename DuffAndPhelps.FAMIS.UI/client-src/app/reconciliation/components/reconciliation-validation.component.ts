import { AlertService } from '../../_core/services/alert.service';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { NgbModalOptions, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AssetFileRecordDto } from '../../_api/dtos/asset-file-record-dto';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'reconciliation-validation',
  templateUrl: './reconciliation-validation.component.html'
})
export class ReconciliationValidationComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  title = 'Reconciliation Validation';
  public showContinue = false;
  public resolveErrorsToCommit = false;
  private navigateTo: string;
  public showMissingMatch = false;
  public showAllocations = false;

  outOfBalanceAllocationIds: string[];
  missingMatchIds: string[];
  assetFileRecords: AssetFileRecordDto[];
  private modalRef: NgbModalRef;

  private _noLongerBusy = new BehaviorSubject<boolean>(false);
  public noLongerBusy = this._noLongerBusy.asObservable();

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private reconciliationService: ReconcileDataService,
  ) { }

  @ViewChild('content', {static: false}) private content: any;

  ngOnInit() {
    this.outOfBalanceAllocationIds = [];
    this.missingMatchIds = [];
    this._noLongerBusy.next(false);
  }

  public open(passThroughRoute?: string): void {
    this.reconciliationService.validateReconciliation(true).subscribe(
      result => {
          this.outOfBalanceAllocationIds = !result.isReconciliationComplete ? result.outOfBalanceAllocations : [];
          this.missingMatchIds = !result.isReconciliationComplete ? result.missingMatches : [];

          this.showContinue = passThroughRoute && passThroughRoute.length > 0;
          this.navigateTo = this.showContinue ? passThroughRoute : '';
          this.showMissingMatch = this.missingMatchIds.length > 0;
          this.showAllocations = this.outOfBalanceAllocationIds.length > 0;
          if (this.showAllocations) {
            this.mapAllocationAssets(this.outOfBalanceAllocationIds, result.fullRecords);
          }
          const options: NgbModalOptions = {
            size: 'lg'
          };
          this.modalRef = this.modalService.open(this.content, options);
          this._noLongerBusy.next(true);
        }
    );
  }

  public continueAnyway() {
    if (this.continueAnyway) {
      this.modalRef.close();
      this.router.navigate([this.navigateTo], {
        relativeTo: this.route.parent
      });
    }
  }

  public mapAllocationAssets(ids: string[], assets: AssetFileRecordDto[]) {
    this.assetFileRecords = [];
    ids.forEach(id => {
      const asset = assets.find(a => a.id === id);
      if (asset) {
        this.assetFileRecords.push(asset);
      }
    });
  }
}
