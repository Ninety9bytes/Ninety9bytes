import { ConsolidationService } from '../../services/consolidation.service';
import { ConsolidationColumn } from '../../../_models/reconciliation/consolidation-column.model';
import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Subscription } from 'rxjs';

const tableRow = node => node.tagName.toLowerCase() === 'tr';
const closest = (node, predicate) => {
  while (node && !predicate(node)) {
      node = node.parentNode;
  }

  return node;
};

@Component({
  selector: 'asset-selected-columns',
  templateUrl: './asset-selected-columns.component.html'
})
export class AssetSelectedColumnsComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Output() onAssetColumnAdded = new EventEmitter<any>();

  loadingBusyIndicator = true;
  selectedColumns: Array<ConsolidationColumn> = [];

  private columnsSubscription: Subscription;

  constructor(
    private consolidationService: ConsolidationService,
  ) { }

  ngOnInit() {
    this.loadSelectedColumns();
  }

  ngOnDestroy() {
    if (this.columnsSubscription) {
      this.columnsSubscription.unsubscribe();
      this.columnsSubscription = null;
    }
  }

  private loadSelectedColumns() {
    this.columnsSubscription = this.consolidationService.getSelectedColumns()
      .subscribe(
      result => {
        this.selectedColumns = result;
        this.loadingBusyIndicator = false;
      },
      error => { },
      () => {
        this.loadingBusyIndicator = false;
      });
  }

  public remove(item: ConsolidationColumn) {
    this.consolidationService.deselectColumns([item]);
    this.consolidationService.defineLayoutDirty = true;

  }

  public autoMapFields(event: any) {
    this.consolidationService.autoMapFields();
  }

}
