import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { Component, Input, OnInit, EventEmitter, ViewContainerRef, Output } from '@angular/core';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { CreateAssetFileCustomColumnDto } from '../../../_api/dtos/create-asset-file-custom-column.dto';
import { FamisGridUpdateColumnSelectionEvent } from '../../../_models/shared/famis-grid-update-column-selection-event.model';
import { WindowOption } from '../../../_models/window-option';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { ModalProperties } from '../../../_models/modal-properties.model';
import { ConfirmModalComponent } from '../confirm-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DataTargetName } from '../../../_enums/data-target-name';

@Component({
  selector: 'grid-column-selector-modal',
  templateUrl: './grid-column-selector-modal.component.html'
})

export class GridColumnSelectorModalComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input() headersAvailable = new Array<GridColumnHeader>();
  @Input() selectedColumns = new Array<string>();
  @Input() sourceTranslationKey = '';
  @Input() showAddCustomColumn = false;
  @Input() groupId = '';
  @Input() assetFileId = '';
  @Input() dataSource: DataTargetName;

  public columnSelection = new Array<string>();
  public knownColumns = new Array<string>();
  private windowRef: WindowRef;
  private pendingCustomColumns = new Array<CreateAssetFileCustomColumnDto>();
  private removeCustomColumns = new Array<GridColumnHeader>();
  private customColumns = new Array<GridColumnHeader>();

  @Output() columnSelectionEvent = new EventEmitter<FamisGridUpdateColumnSelectionEvent>();

  constructor(
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    public assetFileInfoService: AssetFileInfoService,
    private famisGridService: FamisGridService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.headersAvailable.forEach(header => {
      this.knownColumns.push(header.name);
    });
    this.assetFileInfoService.GetInternalColumns().forEach(col => {
      this.knownColumns.push(col);
    });
    this.columnSelection = Object.assign([], this.selectedColumns);
    this.customColumns = this.headersAvailable.filter(header => header.isCustom);
  }

  open(content) {
    this.customColumns = this.customColumns.sort((a, b) => {
      return a.displayName.localeCompare(b.displayName);
    });
    this.windowRef = this.windowManager.open(content, 'Select Columns to Display', <WindowOption>{
      isModal: true
    });

    this.windowRef.result.subscribe(result => { this.close(); });
  }

  close() {
    if (this.removeCustomColumns.length > 0) {
      this.removeCustomColumns.forEach(
        column => {
          this.customColumns.push(column);
          this.knownColumns.push(column.displayName);
        }
      );
      this.removeCustomColumns = [];
    }
    if (this.pendingCustomColumns.length > 0) {
      this.pendingCustomColumns.forEach(
        column => {
          const index = this.knownColumns.findIndex(i => i.toLowerCase() === column.columnName.toLowerCase());
          if (index !== -1) {
            this.knownColumns.splice(index, 1);
          }
        }
      );
      this.pendingCustomColumns = [];
    }
    if (this.windowRef) {
      this.windowRef.close();
    }
  }

  saveChanges() {
    // TODO Save Custom Column
    this.columnSelectionEvent.emit(<FamisGridUpdateColumnSelectionEvent>{
      SelectedHeaders: this.columnSelection,
      PendingCustomColumns: this.pendingCustomColumns,
      RemoveCustomColumns: this.removeCustomColumns
    });
    if (this.pendingCustomColumns.length > 0) {
      this.pendingCustomColumns.forEach(
        column => {
          const newHeader = <GridColumnHeader>{
            displayName: column.columnName,
            name: column.columnName,
            fieldType: column.dataType,
            isCustom: true,
            isSearchable: true,
            isSortable: true,
            isFilterable: true,
            width: '255'
          };
          this.customColumns.push(newHeader);
        }
      );
      this.pendingCustomColumns = [];
    }
    this.removeCustomColumns = [];
    this.windowRef.close();
  }

  public onColumnAdded(col: CreateAssetFileCustomColumnDto) {
    this.pendingCustomColumns.push(col);
    this.knownColumns.push(col.columnName);
  }

  public removePendingColumn(col: CreateAssetFileCustomColumnDto) {
    let index = this.pendingCustomColumns.findIndex(i => i.columnName.toLowerCase() === col.columnName.toLowerCase());
    if (index !== -1) {
      this.pendingCustomColumns.splice(index, 1);
    }
    index = this.knownColumns.findIndex(i => i.toLowerCase() === col.columnName.toLowerCase());
    if (index !== -1) {
      this.knownColumns.splice(index, 1);
    }
  }

  public removeCustomCol(header: GridColumnHeader) {
    if (this.dataSource === DataTargetName.building) {
      this.famisGridService.IsBuildingCustomColumnEmpty(this.groupId, header.displayName).subscribe(
        result => {
          if (result && !result.entity) {
            this.confirmRemoveModal(header);
          } else {
            this.removeCustomHeader(header);
          }
        }
      );
    } else {
      this.famisGridService.IsAssetCustomColumnEmpty(this.assetFileId, header.displayName).subscribe(
        result => {
          if (result && !result.result) {
            this.confirmRemoveModal(header);
          } else {
            this.removeCustomHeader(header);
          }
        }
      );
    }
  }

  public removeCustomHeader(header: GridColumnHeader) {
    let index = this.customColumns.findIndex(i => i === header);
    if (index !== -1) {
      this.customColumns.splice(index, 1);
    }
    index = this.knownColumns.findIndex(i => i.toLowerCase() === header.displayName.toLowerCase());
    if (index !== -1) {
      this.knownColumns.splice(index, 1);
    }
    this.removeCustomColumns.push(header);
  }

  private confirmRemoveModal(header: GridColumnHeader) {
    const modalOptions = <ModalProperties>{
      heading: {
        key: 'Remove custom column'
      },
      body: {
        key: 'Column you are about to remove contains data'
      },
      dismissText: {
        key: 'Cancel'
      },
      successText: {
        key: 'Confirm'
      },
      translateBaseKey: this.i18n.common
    };

    const modal = this.modalService.open(ConfirmModalComponent, { windowClass: 'modal-over-window', backdropClass: 'modal-over-window' });
    modal.componentInstance.options = modalOptions;

    modal.result.then(() => {
      this.removeCustomHeader(header);
    }).catch(err => { });
  }
}
