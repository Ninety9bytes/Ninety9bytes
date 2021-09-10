import { AddAssetColumnComponent } from '../../_shared/components/add-asset-column-component';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { AlertService } from '../../_core/services/alert.service';
import { ReconcileDataGridService } from '../services/reconcile-data-grid.service';
import { HelperService } from '../../_core/services/helper.service';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { WindowManager } from '../../_core/services/window-manager.service';
import { Component, ViewContainerRef, ViewChild, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { InventoryService } from '../../_api/services/reconciliation/inventory.service';
import { DataTargetName } from '../../_enums/data-target-name';
import { ColumnAddedEvent } from '../../_models/column-added-event.model';
import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { WindowOption } from '../../_models/window-option';
import { ReconcileDataGridComponent } from './reconcile-data-grid.component';
import { UserGridService } from '../../_core/services/user-grid.service';
import { stringify } from 'querystring';
import { SettingsApiService } from '../../_api/_runtime/services/settings-api.service';
import { SettingType } from '../../_enums/setting-type';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'order-asset-columns-component',
  templateUrl: './order-asset-columns-component.html'
})
export class OrderAssetColumnsComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  constructor(
    private inventoryService: InventoryService,
    private reconcileDataService: ReconcileDataService,
    private alertService: AlertService,
    private reconcileDataGridService: ReconcileDataGridService,
    private helperService: HelperService,
    private assetFileInfoService: AssetFileInfoService,
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    private reconcileDataGridComponent: ReconcileDataGridComponent,
    private userGridService: UserGridService
    , private settingsApiService: SettingsApiService
  ) {}

  @ViewChild('content', {static: false}) private content: any;
  @ViewChild(AddAssetColumnComponent, {static: false}) addCustomColumnsComponent: AddAssetColumnComponent;

  title: 'Select Columns to Display';

  @Input() dataSource: DataTargetName;
  @Input() assetFileId: string;
  @Input() mappedColumns: string[];
 @Output() onColumnOrderUpdated = new EventEmitter();
  @Output() columnAdded = new EventEmitter<ColumnAddedEvent>();
  isAddingColumn = false;
  public pendingCustomColumns = new Array<CreateAssetFileCustomColumnDto>();

  public columnNames: string[];

  public headersAvailable = new Array<GridColumnHeader>();
  public selectedHeaders = new Array<string>();
  settingName: string;
  private assetfileId: string;
  private windowRef: WindowRef;
private showAllColumns = false;

ngOnInit() {
  this.showAllColumns = false;
}
  open() {
    const s = this;
    
    this.reconcileDataGridService.headers$.subscribe(headers => {
      if (headers) {
        if (this.mappedColumns === undefined || this.showAllColumns ) {
          this.headersAvailable = headers[this.dataSource].filter(
          header => this.assetFileInfoService.GetInternalColumns().some(hidden => hidden === header.name) === false
          );
        } else {
        this.headersAvailable = headers[this.dataSource].filter(
          header => this.mappedColumns.some(hidden => hidden.toLowerCase() === header.name.toLowerCase()) === true
        );
        }
      }
    });

    this.reconcileDataGridService.selectedHeaders$.subscribe(selectedHeaders => {
      if (selectedHeaders) {
        this.selectedHeaders = selectedHeaders[this.dataSource];
      }
    });

    this.columnNames = this.headersAvailable.map(col => col.name);

    this.reconcileDataGridService.pendingCustomColumns$.subscribe(columns => {
      if (columns) {
        this.pendingCustomColumns = columns[this.dataSource];
      } else {
        this.pendingCustomColumns = new Array<CreateAssetFileCustomColumnDto>();
      }
    });

    this.windowRef = this.windowManager.open(this.content, 'Select Columns to Display', <WindowOption> {
      isModal: true
    });
  }
public DisplayAllColumnsToggle(ev: any)
{
    this.showAllColumns = !this.showAllColumns;

    this.reconcileDataGridService.headers$.subscribe(headers => {
      if (headers) {
        if (this.mappedColumns === undefined || this.showAllColumns ) {
          this.headersAvailable = headers[this.dataSource].filter(
          header => this.assetFileInfoService.GetInternalColumns().some(hidden => hidden === header.name) === false
          );
        } else {
        this.headersAvailable = headers[this.dataSource].filter(
          header => this.mappedColumns.some(hidden => hidden.toLowerCase() === header.name.toLowerCase()) === true
        );
        }
      }
    });

    this.reconcileDataGridService.updateAvailableColumns(this.headersAvailable, this.dataSource);
}

public updateCurrentView(clearCache: boolean = false) {
  const s = this;

}

  public saveChanges() {
    const s = this;
    // TODO : Set the Ordering
    s.reconcileDataGridService.updateSelectedHeaders(s.selectedHeaders, s.dataSource);
    this.userGridService.saveSelectedHeaders(this.reconcileDataGridComponent.gridSettingsName, s.selectedHeaders);

    // Save custom columns
    if (s.pendingCustomColumns.length > 0) {
      s.inventoryService.addAssetCustomColumns(s.assetFileId, s.pendingCustomColumns).subscribe(result => {
        if (result.code === 0) {
          s.alertService.success('Columns added to asset file.');
          s.columnAdded.emit(<ColumnAddedEvent>{ dataSource: s.dataSource, columns: result.result });
          s.reconcileDataGridService.updateSelectedHeaders(s.selectedHeaders, s.dataSource);
          s.reconcileDataGridService.clearPendingColumns(s.dataSource);
        } else {
          s.alertService.error('An error occurred, asset column(s) could not be added.');
        }
        s.windowRef.close();
      });
    } else {
      s.windowRef.close();
    }
  }

  public cancle() {
    this.windowRef.close();
  }

  public removePendingColumn(col: CreateAssetFileCustomColumnDto) {
    let index = this.pendingCustomColumns.findIndex(i => i.columnName.toLowerCase() === col.columnName.toLowerCase());
    if (index !== -1) {
      this.pendingCustomColumns.splice(index, 1);
    }
    index = this.columnNames.findIndex(i => i.toLowerCase() === col.columnName.toLowerCase());
    if (index !== -1) {
      this.columnNames.splice(index, 1);
    }
  }

  public onColumnAdded(col: CreateAssetFileCustomColumnDto) {
    // Create a new header
    const header = <GridColumnHeader>{};
    const columnName = this.helperService.lowerCasePropertyName(col.columnName);
    col.columnName = columnName;
    header.displayName = col.columnName;
    header.name = columnName;
    header.isCustom = true;
    header.order = this.headersAvailable.length + 1;
    this.headersAvailable.push(header);
    this.selectedHeaders.push(header.name);
    this.columnNames.push(col.columnName);
    this.reconcileDataGridService.addPendingColumn(this.dataSource, col);
  }
}
