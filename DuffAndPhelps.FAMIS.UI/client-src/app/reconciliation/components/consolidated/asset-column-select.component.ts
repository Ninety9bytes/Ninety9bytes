import { AlertService } from '../../../_core/services/alert.service';
import { ConsolidationService } from '../../services/consolidation.service';

import { SelectableSettings } from '@progress/kendo-angular-grid/dist/es/selection/selectable-settings';
import { ConsolidationColumn } from '../../../_models/reconciliation/consolidation-column.model';
import { SelectionEvent } from '@progress/kendo-angular-grid';
import { OrderPipe } from 'ngx-order-pipe';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataTargetName } from '../../../_enums/data-target-name';

@Component({
  selector: 'asset-column-select',
  templateUrl: './asset-column-select.component.html'
})
export class AssetColumnSelectComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input('file-type') assetFileType: DataTargetName;
  @Input() title: string;
  @Output() onAssetColumnAdded = new EventEmitter<any>();

  loadingBusyIndicator = true;
  assetFileFields: Array<ConsolidationColumn>;
  selectedItems: Array<string> = new Array<string>();

  selectableSettings: SelectableSettings = {
    enabled: true,
    mode: 'multiple'
  };

  constructor(
    private alertService: AlertService,
    private consolidationService: ConsolidationService
  ) { }

  ngOnInit() {
    this.loadColumns();
  }

  private loadColumns() {
    this.consolidationService.getColumns(this.assetFileType)
      .subscribe(
      results => {
        this.assetFileFields = results;
        this.assetFileFields = this.assetFileFields
          .filter(a => this.consolidationService.ExcludedMappedColumns.indexOf(a.sourceColumn) === -1);
        this.selectedItems = this.assetFileFields
          .filter(item => item.selected)
          .map(result => result.sourceColumn);
        this.loadingBusyIndicator = false;
      },
      error => { },
      () => {
        this.loadingBusyIndicator = false;
      });
  }

  public onSelectionChange(event: SelectionEvent) {

    this.consolidationService.defineLayoutDirty = true;

    if (event.deselectedRows.length > 0) {
      this.consolidationService.deselectColumns(<ConsolidationColumn[]>event.deselectedRows.map(row => row.dataItem));
    }
    if (event.selectedRows.length > 0) {
      this.consolidationService.selectColumns(<ConsolidationColumn[]>event.selectedRows.map(row => row.dataItem));
    }
  }
}
