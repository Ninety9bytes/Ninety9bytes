import { FamisGridComponent } from '../../_shared/components/famis-grid.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { AdministrationService } from '../../project-profile/services/administration.service';
import { TransactionsService } from '../services/transactions.service';
import { TransactionsInfoService } from '../../_core/services/transactions-info-service';
import { HelperService } from '../../_core/services/helper.service';
import { RevertComponent } from '../../_shared/components/grid-actions/revert.component';
import { transactionHeaders } from '../../processing/default-values/default-transaction-headers';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { Asset } from '../../_models/asset.model';
import { Subject, Subscription } from 'rxjs';
import { BreadCrumb } from '../../_models/breadcrumbs.model';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { WindowOption } from '../../_models/window-option';
import { FamisGridCacheResult } from '../../_models/shared/famis-grid-cache-result.model';
import { SelectionChangeEvent } from '../../_models/selection-change-event.model';

@Component({
  selector: 'transactions-grid',
  templateUrl: 'transactions-grid.component.html'
})
export class TransactionsGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public transactionsGrid: FamisGrid;
  public selectedAssets = new Array<Asset>();
  public groupId: string;

  @Output() gridSelections = new EventEmitter<Array<Asset>>();

  @ViewChild(FamisGridComponent, {static: false}) famisGrid: FamisGridComponent;

  private windowSize = 500;
  private destroyed$ = new Subject();

  breadCrumbs = [
    <BreadCrumb>{ name: 'Administration', routerLink: '../' },
    <BreadCrumb>{ name: 'Transactions', routerLink: 'Transactions', isDisabled: true }
  ];

  constructor(
    private famisGridService: FamisGridService,
    private transactionsService: TransactionsService,
    private administrationService: AdministrationService,
    private transactionsInfoService: TransactionsInfoService,
    private helperService: HelperService,
    private windowManager: WindowManager,
  ) {}

  ngOnInit() {
    this.administrationService.groupIdContext$.pipe(takeUntil(this.destroyed$))
    .subscribe(context => {
      this.groupId = context.groupId;
    });

    this.transactionsGrid = <FamisGrid>{
      height: 600,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: '',
      dataSource: null,
      supportedOperators: [FamisGridFeature.ColumnSelection, FamisGridFeature.Sort],
      actions: ['Revert'],
      translationBaseKey: this.i18n.transactions
    };

    this.transactionsGrid.loading = this.transactionsService
      .getSearchTransactionsByGroupId(this.groupId, this.transactionsService.defaultSearchRequest)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.transactionsGrid.columnHeaders = transactionHeaders;

        this.transactionsGrid.selectedHeaders = this.transactionsInfoService.GetDefaultColumns();
        this.transactionsGrid.loading = this.processCacheUpdate();
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Revert':
        const windowRef = this.windowManager.open(RevertComponent, 'Revert', <WindowOption>{
          isModal: true,
          width: 1500,
        });

        windowRef.content.instance.transactionId = event.item.transactionId;
        windowRef.content.instance.activity = event.item.activity;
        windowRef.content.instance.assetTagNumber = event.item.assetTagNumber;
        windowRef.content.instance.submitSuccess.subscribe(() => {
          this.updateCache();
        });
        break;

      default:
        break;
    }
  }

  updateCache(request?: FamisGridCacheResult) {
    this.transactionsGrid.cacheLoading = this.processCacheUpdate(request);
  }

  handleSelectionChanged(event: SelectionChangeEvent) {
    event.itemsAdded.forEach(item => {
      const index = this.selectedAssets.indexOf(item.dataItem);
      if (index === -1) {
        this.selectedAssets.push(<Asset>item.dataItem);
      }
    });

    event.itemsRemoved.forEach(item => {
      const index = this.selectedAssets.indexOf(item.dataItem);
      if (index !== -1) {
        this.selectedAssets.splice(index, 1);
      }
    });

    this.gridSelections.emit(this.selectedAssets);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.transactionsService
      .updateTransactionsData(
        this.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
        cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
        cacheUpdateRequest ? cacheUpdateRequest.filters : null
      )
      .subscribe(dto => {
        this.transactionsGrid.totalRecordCount = dto.totalInRecordSet;

        s.famisGridService.setCacheRecords(
          dto.transactions,
          s.transactionsGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.numberInThisPayload,
          this.transactionsGrid.windowSize
        );
      });
  }
}
