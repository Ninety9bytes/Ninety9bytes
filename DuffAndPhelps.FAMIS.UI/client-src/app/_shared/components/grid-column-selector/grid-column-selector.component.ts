import { GridComponent, SelectionEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { ReconcileDataGridService } from '../../../reconciliation/services/reconcile-data-grid.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'grid-column-selector',
  templateUrl: './grid-column-selector.component.html'
})
export class GridColumnSelectorComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public gridView: GridDataResult;

  @Input()
  headersAvailable = new Array<GridColumnHeader>();
  @Input()
  selectedColumns = new Array<string>();
  @Input()
  sourceTranslationKey = '';

  @Output()
  onColumnSelectionChange = new EventEmitter<Array<string>>();
  subscription: Subscription;
  public sort: SortDescriptor[] = [
    {
      field: 'displayName',
      dir: 'asc'
    }
  ];

  constructor(
    private reconcileDataGridService: ReconcileDataGridService
  ) {}

  ngOnInit() {
    this.reconcileDataGridService.clearAvailableColumns();

    this.subscription =  this.reconcileDataGridService.availableColumns$.subscribe(headers => {
      if (headers && headers.length > 0) {
     this.headersAvailable = headers;
     this.loadHeaders();
      }
   });

    this.loadHeaders();
  }

  // TODO: Handle sorting of i18n/translated strings
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadHeaders();
  }

  private loadHeaders(): void {
    this.gridView = {
      data: orderBy(this.headersAvailable, this.sort),
      total: this.headersAvailable.length
    };
  }
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
}
}
