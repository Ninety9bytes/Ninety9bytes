import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';

import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { Component, ViewChild, Output, Input, OnInit, EventEmitter, ViewContainerRef } from '@angular/core';
import { ColumnMap } from '../../_models/column-map.model';
import { SupportedCustomColumnDataTypeDto } from '../../_api/dtos/shared/supported-custom-column-datatype.dto';
import { WindowOption } from '../../_models/window-option';
import { SpreadsheetColumnDto } from '../../_api/dtos/spreadsheet-column.dto';

@Component({
  selector: 'create-custom-column',
  templateUrl: './create-custom-column.component.html'
})
export class CreateCustomColumnComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public name: string;
  public dataType: number;
  public isNameValid: boolean;

  @ViewChild('content', { static: false }) private content: any;
  @Output() onAddCustomColumn = new EventEmitter<ColumnMap>();
  @Input() columnNames = new Array<string>();

  title: string;
  action: string;
  customColumnDataTypes = new Array<SupportedCustomColumnDataTypeDto>();

  constructor(
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    private dataImportService: DataImportService,
    private assetFileInfoService: AssetFileInfoService
  ) {}

  ngOnInit() {
    // Get Suppported DataTypes
    this.dataImportService.getCustomColumnDataTypes().subscribe(dataTypes => {
      this.customColumnDataTypes = dataTypes;
    });
  }

  open(event: any) {
    event.preventDefault();

    this.assetFileInfoService.GetInternalColumns().forEach(c => {
      this.columnNames.push(c);
    });
    // this.customcolumn = new CustomColumn();
    this.title = 'Create Custom Column';
    this.action = 'Create';

    this.name = null;
    this.dataType = null;
    this.isNameValid = true;

    this.windowManager.open(this.content, 'Create Custom Column', <WindowOption>{
      isModal: true
    });
  }

  close() {
    this.windowManager.close();
  }

  onSubmit(form) {
    this.isNameValid = this.checkName(this.name);
    if (form.valid && this.isNameValid) {
      if (this.action === 'Create') {
        this.windowManager.close();

        const customColumn = <ColumnMap>{
          spreadsheetColumn: <SpreadsheetColumnDto>{},
          dataTargetField: this.name,
          importTemplateColumnId: this.generateTempId(),
          columnDataType: this.dataType,
          isCustom: true,
          isAutoMapped: false
        };

        this.onAddCustomColumn.emit(customColumn);
      }
    }
  }

  private checkName(name: string): boolean {
    for (let i = 0; i < this.columnNames.length; i++) {
      if (name.toLowerCase() === this.columnNames[i].toLowerCase().replace(/\s/g, '')) {
        return false;
      }
    }
    return true;
  }

  private generateTempId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
