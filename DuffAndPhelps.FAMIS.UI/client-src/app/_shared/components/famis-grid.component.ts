import { SortDescriptor } from '@progress/kendo-data-query/dist/es/main';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { AlertService } from '../../_core/services/alert.service';
import { HelperService } from '../../_core/services/helper.service';
import { CellCloseEvent } from '@progress/kendo-angular-grid/dist/es2015/editing/cell-close-event';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { UserGridService, ColumnSize, GridSetting } from '../../_core/services/user-grid.service';
import { ColumnReorderEvent, RowClassArgs, ColumnComponent, 
  SelectableSettings, DataStateChangeEvent, GridDataResult, SelectionEvent } from '@progress/kendo-angular-grid';
import { UserStore } from '../../_core/user/user.store';
import { takeUntil, tap } from 'rxjs/operators';
import { of, Subject, Observable } from 'rxjs';
import { Component, OnInit, OnDestroy, Input, EventEmitter, Output } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { FormGroup } from '@angular/forms';
import { DataItemValue } from '../../_models/data-item-value.model';
import { FamisGridCacheResult, FamisGridCacheWindow } from '../../_models/shared/famis-grid-cache-result.model';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { SelectionChangeEvent } from '../../_models/selection-change-event.model';
import { CompositeFilterDescriptor, State, filterBy } from '@progress/kendo-data-query';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { FieldType } from '../../_enums/field-type';
import { Router } from '@angular/router';
import { FamisGridUpdateColumnSelectionEvent } from '../../_models/shared/famis-grid-update-column-selection-event.model';
import { DataTargetName } from '../../_enums/data-target-name';
import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';
import { FormField } from '../../_models/form-field.model';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';

@Component({
  selector: 'famis-grid',
  templateUrl: './famis-grid.component.html'
})
export class FamisGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input() famisGrid: FamisGrid;
  @Input() showAddCustomColumn = false;
  @Input() InGridEditableNonNegativeColumns = Array<string>();
  @Input() isPersistentGrid = true; // defaulted to true. Pass in "false" where you don't need the grid to be persistent

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  // Usage of Any type is by design as Grid can present a collection of ANY datatype
  public gridData: any;
  public formGroup: FormGroup;
  public selectableSettings: SelectableSettings;
  public selectedRows = [];

  public canSelect: boolean | string = false;
  public canSort: boolean | string = false;
  public canFilter: boolean | string = 'menu';
  public canSelectColumns = false;
  public canInGridEditCells: boolean;

  public editedRecords = new Array<DataItemValue>();
  public editedRecordsWithErrors = new Array<DataItemValue>();

  @Output() updateCacheEvent = new EventEmitter<FamisGridCacheResult>();
  @Output() actionEvent = new EventEmitter<FamisGridActionEvent>();
  @Output() selectionChanged = new EventEmitter<SelectionChangeEvent>();

  @Output() filterChanged = new EventEmitter<CompositeFilterDescriptor>();
  @Output() sortChanged = new EventEmitter<Array<SortDescriptor>>();
  @Output() dataStateChanged = new EventEmitter<DataStateChangeEvent>();
  @Output() cellValueChanged = new EventEmitter<Array<DataItemValue>>();

  public sort: SortDescriptor[];
  public view: Observable<GridDataResult>;

  public filterRoot: CompositeFilterDescriptor;
  public dataLoading = false;

  public selectedHeaders = new Array<GridColumnHeader>();
  public state: State;
  private editedRowIndex: string;
  private unsortableFields: Array<string> = ['inventoryImageUrl1'];

  public gridSettingsName: string;

  public userId: string;
  public gridSettingsLoaded: boolean | undefined = undefined;

  public fieldTypes = FieldType;

  public hideTableCounts = false;
  public showDashboarGroupSubGrid = false;

  private fixedColumnLength = 0;
  private grid: string;
  private defaultHeaderWidth: '255';

  private scrollingMode: string;

  constructor(
    private famisGridService: FamisGridService,
    private alertService: AlertService,
    private helperService: HelperService,
    private userGridService: UserGridService,
    private router: Router,
    private userStore: UserStore,
  ) {}

  ngOnInit(): void {
    const s = this;
    s.dataLoading = true;
    this.gridSettingsName = this.userGridService.createUserGridId(
      this.famisGrid.dataSource ? this.famisGrid.dataSource.toString() : null,
      this.router.url.toString().split('?')[0],
      this.famisGrid.name
    );

    this.famisGrid.columnToSelectBy = !!this.famisGrid.columnToSelectBy ? this.famisGrid.columnToSelectBy : 'id';

    this.state = {
      skip: 0,
      take: this.famisGridService.windowSize
    };

    this.famisGrid.height = !!this.famisGrid.height ? this.famisGrid.height : 330;

    this.famisGrid.scrollingMode = !!this.famisGrid.scrollingMode ? this.famisGrid.scrollingMode : 'virtual';

    this.filterRoot = { logic: 'and', filters: [] };

    this.userStore.user.subscribe(user => {
      this.userId = user.profile.IdentityId.toString();
      this.userGridService.getSettings(this.userId, this.gridSettingsName, this.famisGrid.selectedHeaders).subscribe(savedSetting => {
        const defaultSort = this.famisGrid.defaultSort ? this.famisGrid.defaultSort : null;
        if (!savedSetting.gridSort) {
          savedSetting.gridSort = defaultSort;
        }

        this.applySavedSettings(savedSetting);

        if (this.isPersistentGrid) {
          this.userGridService.saveSettings(
            this.gridSettingsName,
            savedSetting.headers,
            null,
            this.userId,
            savedSetting.kendoGridState ? savedSetting.kendoGridState : null,
            savedSetting.filters ? savedSetting.filters : null,
            savedSetting.columnSizes ? savedSetting.columnSizes : null,
            savedSetting.gridSort ? savedSetting.gridSort : defaultSort,
          ).subscribe(updatedSetting => {
            this.userGridService.updateUserSettingsCache(updatedSetting);
          });
        }
      });
    });

    let order = 0;
    this.famisGrid.columnHeaders.forEach(header => {
      header.order = order++;
      if (header.width === undefined) {
        header.width = '255';
      }
    });

    this.editedRecords = new Array<DataItemValue>();

    this.famisGridService.editedRecords$.subscribe(editedRecords => {
      this.editedRecords = editedRecords;
    });

    this.editedRecordsWithErrors = new Array<DataItemValue>();

    this.famisGridService.editedRecordsWithErrors$.subscribe(editedRecordsWithErrors => {
      this.editedRecordsWithErrors = editedRecordsWithErrors;
    });

    if (this.famisGrid.supportedOperators) {
      this.hideTableCounts = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.HideTableCounts);
      this.canSelect = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.SingleSelectable)
                                                              ? `{checkboxOnly:true, 'single'}`
                                                              : false;
      this.canSelect = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.MultiSelectable)
                                                              ? `{checkboxOnly:true, 'multiple'}`
                                                              : false;

      this.showDashboarGroupSubGrid = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.DashboardGroupSubGrid);
      this.canSort = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.Sort)
                      ? `{allowUnsort: false,mode: 'single'}`
                      : false;
      this.canFilter = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.Filter) ? 'menu' : false;
      this.canSelectColumns = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.ColumnSelection);
      this.canInGridEditCells = this.famisGrid.supportedOperators.some(x => x === FamisGridFeature.InGridEditable);

      this.fixedColumnLength = this.canSelect ? 1 : 0;
      this.fixedColumnLength = !!this.famisGrid.actions && this.famisGrid.actions.length > 0
                                ? this.fixedColumnLength + 1
                                : this.fixedColumnLength;
    }

    this.famisGridService.cachedRecords$
    .pipe(takeUntil(this.destroyed$))
    .subscribe(cachedRecords => {
      s.dataLoading = true;
      if (cachedRecords[this.famisGrid.gridId]) {
        s.updateView(cachedRecords[this.famisGrid.gridId]);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  public inGridSave() {
    const enumColumns = this.famisGrid.columnHeaders.filter(header => header.enumOptions && header.enumOptions.length > 0);
    if (enumColumns && enumColumns.length > 0) {
      this.editedRecords.forEach(record => {
        const enumKeys = Object.keys(record.dataItem).filter(key => enumColumns.map(enumColumn => enumColumn.name).includes(key));
        enumKeys.forEach(enumKey => {
          const enumColumn = enumColumns.find(col => col.name === enumKey);
          if (enumColumn) {
            const enumOption = enumColumn.enumOptions.find(option => option.displayName === record.dataItem[enumKey]);
            if (enumOption) {
              record.dataItem[enumKey] = enumOption.name;
            }
          }
        });
      });
    }
    this.cellValueChanged.emit(this.editedRecords);
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    const s = this;
    s.dataLoading = true;
    // Emit change right away to let consuming component handle
    s.dataStateChanged.emit(state);
    this.state = state;
    this.famisGridService
      .update(s.famisGrid.gridId, s.state.skip, s.state.take, s.famisGrid.totalRecordCount,
        s.famisGridService.currentSort[s.famisGrid.gridId])
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        if (result.updateCache) {
          s.updateCacheEvent.emit(result);
        } else if (result.gridId === s.famisGrid.gridId && result.cachedData.length) {
          s.updateView(result.cachedData);
        }
      });
  }

  public onColumnSelection(selectedEvent: FamisGridUpdateColumnSelectionEvent) {
    if (selectedEvent.RemoveCustomColumns && selectedEvent.RemoveCustomColumns.length > 0) {
      const removeCustomColumns = selectedEvent.RemoveCustomColumns;
      if (this.famisGrid.dataSource === DataTargetName.building) {
        selectedEvent.RemoveCustomColumns.forEach(
          customColumn => {
            // Delete custom column from Building
            this.famisGridService.DeleteBuildingCustomColumn(this.famisGrid.groupId,
              customColumn.displayName).subscribe(result => {
                if (result) {
                  removeCustomColumns.pop();
                  this.handleDeletedColumnResult(selectedEvent, removeCustomColumns, customColumn);
                }
              });
          });
      } else {
        selectedEvent.RemoveCustomColumns.forEach(
          customColumn => {
            // Delete custom column from Asset
            this.famisGridService.DeleteAssetCustomColumn(this.famisGrid.fileId,
              customColumn.displayName).subscribe(result => {
                if (result) {
                  removeCustomColumns.pop();
                  this.handleDeletedColumnResult(selectedEvent, removeCustomColumns, customColumn);
                }
              });
          });
      }
    } else {
      this.createCustomColumns(selectedEvent);
    }
  }

  private createCustomColumns(selectedEvent: FamisGridUpdateColumnSelectionEvent) {
    if (selectedEvent.PendingCustomColumns && selectedEvent.PendingCustomColumns.length > 0) {
      // Create Custom Columns
      if (this.famisGrid.dataSource === DataTargetName.building) {
        this.famisGridService.AddBuildingCustomColumns(this.famisGrid.groupId,
          selectedEvent.PendingCustomColumns).subscribe(createdBuildingColumnsResult => {
          this.handleCreatedColumnsResult(selectedEvent, createdBuildingColumnsResult);
        });
      } else {
        this.famisGridService.AddAssetCustomColumns(this.famisGrid.fileId,
          selectedEvent.PendingCustomColumns).subscribe(createdColumnsResult => {
          this.handleCreatedColumnsResult(selectedEvent, createdColumnsResult.result);
        });
      }
    } else {
      // Set Selected Headers
      this.setSelectedHeaders(selectedEvent.SelectedHeaders);
    }
  }

  private handleCreatedColumnsResult(selectedEvent: FamisGridUpdateColumnSelectionEvent,
                                     createdColumnsResult: CreateAssetFileCustomColumnDto[]) {
    this.alertService.success('Columns added to successfully.');
    createdColumnsResult.forEach(column => {
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
      if (this.famisGrid.dataSource === DataTargetName.building) {
        newHeader.isEditable = true;
      }
      this.famisGrid.columnHeaders.push(newHeader);
      // Set Selected Headers
      selectedEvent.SelectedHeaders.push(newHeader.name);
    });
    this.setSelectedHeaders(selectedEvent.SelectedHeaders);
  }


  private handleDeletedColumnResult(selectedEvent: FamisGridUpdateColumnSelectionEvent,
                                    removeCustomColumns: GridColumnHeader[],
                                    column: GridColumnHeader) {
    this.alertService.success('Column removed successfully.');
    // Remove column from grid column headers
    let index = this.famisGrid.columnHeaders.findIndex(header => header.name === column.name);
    if (index !== -1) {
      this.famisGrid.columnHeaders.splice(index, 1);
    }
    // Remove column from selected headers
    index = selectedEvent.SelectedHeaders.findIndex(headerName => headerName === column.name);
    if (index !== -1) {
      selectedEvent.SelectedHeaders.splice(index, 1);
    }
    this.setSelectedHeaders(selectedEvent.SelectedHeaders);
    this.gridData.forEach(record => {
      if (Object.keys(record).includes(column.name)) {
        delete record[column.name];
      }
    });
    if (removeCustomColumns.length === 0) {
      this.createCustomColumns(selectedEvent);
    }
  }

  private setSelectedHeaders(columnsSelected: Array<string>) {
    this.selectedHeaders = new Array<GridColumnHeader>();

    columnsSelected.forEach(name => {
      const index = this.famisGrid.columnHeaders.findIndex(c => !!c && c.name === name);

      if (index !== -1) {
        this.selectedHeaders.push(this.famisGrid.columnHeaders[index]);
      }
    });

    this.userGridService.saveSettings(
      this.gridSettingsName,
      this.selectedHeaders.map(c => c.name),
      null,
      this.userId)
        .subscribe(saveResult => {
          this.userGridService.updateUserSettingsCache(saveResult);
          this.updateHeaders(this.selectedHeaders.map(c => c.name));
        });
  }

  public updateCurrentView() {
    const s = this;

    this.famisGridService
      .update(s.famisGrid.gridId, s.state.skip, s.state.take, s.famisGrid.totalRecordCount,
        s.famisGridService.currentSort[s.famisGrid.gridId])
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        if (result.cachedData.length > 0 && result.gridId === this.famisGrid.gridId) {
          s.updateView(result.cachedData);
        }
      });
  }

  public applySavedFilter(filter: CompositeFilterDescriptor) {

    this.state.filter = filter;
    let filterCleared = false;

    if (this.state.filter.filters && this.state.filter.filters.length === 0) {
      filterCleared = true;
    }

  }

  public filterChange(filter: CompositeFilterDescriptor) {
    const s = this;
    this.applySavedFilter(filter);

    this.famisGridService.mapFilterTerms(filter, s.famisGrid.gridId, s.famisGrid.dataSource).subscribe(result => {
      s.famisGridService
        .update(s.famisGrid.gridId, s.state.skip, s.state.take, s.famisGridService.windowSize,
          s.famisGridService.currentSort[s.famisGrid.gridId], true)
        .pipe(takeUntil(s.destroyed$))
        .subscribe(res => {
          // send out a filter save http post request to the api
          this.userGridService.saveActiveFilters(this.gridSettingsName, s.state, filter,
            ).subscribe(gridFilterSettingResult => {
              this.userGridService.updateUserSettingsCache(gridFilterSettingResult);
            s.updateCacheEvent.emit(res);
          });
        });
    });
  }

  public cellClick({ sender, rowIndex, columnIndex, dataItem, isEdited, column }) {
    if (this.canInGridEditCells) {
      this.editCell({ sender, rowIndex, columnIndex, dataItem, isEdited, column });
    }
  }

  public rowCallback = (context: RowClassArgs) => {
    const id = context.dataItem.id;

    if (this.editedRecordsWithErrors && this.editedRecordsWithErrors.findIndex(c => c.itemId === id) !== -1) {
      return 'edited-row with-errors';
    } else if (this.editedRecords && this.editedRecords.findIndex(c => c.itemId === id) !== -1) {
      return 'edited-row';
    }
  }

  public viewInGridSaveErrors(): void {
    this.editedRecordsWithErrors.forEach(error => {
      console.log(`In grid errors ${error.value}`);
    });
  }

  public editCell({ sender, rowIndex, columnIndex, dataItem, isEdited, column }) {
    if (!isEdited && column.editable === 'true') {
      const fields = new Array<FormField>();

      this.famisGrid.columnHeaders.forEach(columnHeader => {
        fields.push(<FormField>{
          id: columnHeader.name,
          displayName: columnHeader.displayName,
          type: columnHeader.fieldType
        });
      });

      this.formGroup = this.helperService.toFormGroup(fields);
      this.formGroup.patchValue(this.famisGridService.mapToTypedValues(dataItem, this.famisGrid.columnHeaders));

      sender.editCell(rowIndex, columnIndex, this.formGroup);
    }
  }

  public onColumnReorder(event: ColumnReorderEvent) {
    if (event.newIndex <= this.fixedColumnLength - 1) {
      event.preventDefault();
    } else {
      const headerNames = this.selectedHeaders.map(c => c.name);
      const reorderedColumns =
        this.move(headerNames, event.oldIndex - this.fixedColumnLength, event.newIndex - this.fixedColumnLength) as Array<string>;

      this.userGridService.saveSelectedHeaders(this.gridSettingsName, reorderedColumns).subscribe(saveResult => {
        this.userGridService.updateUserSettingsCache(saveResult);
        this.applySavedSettings(saveResult.settingJson);
      });
    }
  }

  public onColumnResize(event: any) {
    const sizes = new Array<ColumnSize>();
    const resizedColumn = (event[0].column.field);
    this.selectedHeaders.forEach(h => {
      let width = h.width ? +h.width : +this.defaultHeaderWidth;
      if (h.name === resizedColumn) {
        width = event[0].newWidth;
      }
      sizes.push(<ColumnSize>{
        fieldName: h.name,
        width: width
      });
    });
    this.userGridService.saveColumnSizes(this.gridSettingsName, sizes).subscribe(saveRes => {
      this.userGridService.updateUserSettingsCache(saveRes);
    });
  }

  public cellClose(args: CellCloseEvent) {
    const { dataItem, column } = args;

    if (!this.formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (this.formGroup.dirty) {
      const columnFieldIsNonNegative = this.InGridEditableNonNegativeColumns.some(negativeColumn => negativeColumn === column.field);

      dataItem[column.field] = columnFieldIsNonNegative && this.formGroup.value[column.field] < 0
        ? Math.abs(this.formGroup.value[column.field])
        : this.formGroup.value[column.field];

      this.famisGridService.addEditedRecord(dataItem.id, dataItem);
    }
  }

  public gridSelectionChange(event: SelectionEvent) {
    if (this.canSelect || this.famisGrid.name === 'Duplicates') {

        const selectionChangeEvent = <SelectionChangeEvent>{
          itemsAdded: event.selectedRows,
          itemsRemoved: event.deselectedRows
        };
        this.selectionChanged.emit(selectionChangeEvent);
      }
  }

  private applySavedSettings(savedSetting: GridSetting) {
    const s = this;
    const cacheUpdate = <FamisGridCacheResult> {
      cacheWindow: <FamisGridCacheWindow> {
        skip: 0,
        take: this.famisGridService.windowSize
      }
    };
    if (savedSetting.kendoGridState) {
      s.state = savedSetting.kendoGridState;
    }
    if (savedSetting.gridSort) {
      s.sort = savedSetting.gridSort;
      s.state.sort = savedSetting.gridSort;
      s.famisGridService.currentSort[s.famisGrid.gridId] = s.mapSortDto(savedSetting.gridSort);
      cacheUpdate.sortTerms = s.famisGridService.currentSort[s.famisGrid.gridId];
    }

    s.state.skip = cacheUpdate.cacheWindow.skip;
    s.state.take = cacheUpdate.cacheWindow.take;

    this.updateHeaders(savedSetting.headers);
    // update filters with the ones fetched from the database
    if (savedSetting.filters && savedSetting.filters.filters) {
      s.state.filter = savedSetting.filters;
      s.applySavedFilter(savedSetting.filters);
    }
    if (savedSetting.columnSizes) {
      this.famisGrid.columnHeaders.forEach(header => {
        const index = savedSetting.columnSizes.findIndex(c => c.fieldName === header.name);
        if (index !== -1){
          header.width = savedSetting.columnSizes[index].width.toString();
        }
      });
    }

    if (savedSetting.filters) {
      this.filterChange(savedSetting.filters);
    } else {
      s.updateCacheEvent.emit(cacheUpdate);
    }

  }

  private updateHeaders(headers: Array<string>) {
    const s = this;

    this.selectedHeaders = new Array<GridColumnHeader>();
    this.famisGrid.selectedHeaders = new Array<string>();

    headers.forEach(name => {
      s.gridSettingsLoaded = true;

      const index = this.famisGrid.columnHeaders.findIndex(c => !!c && c.name === name);

      if (index !== -1) {
        s.selectedHeaders.push(s.famisGrid.columnHeaders[index]);
        this.famisGrid.selectedHeaders.push(name);
      }
    });
  }

  private move(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      let k = new_index - arr.length;
      while (k-- + 1) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

  private mapGridDataResult(): Observable<GridDataResult> {
    if (this.gridData && this.gridData.length > 0) {
      const gridDataResult = <GridDataResult>{
        data: filterBy(this.gridData, this.filterRoot),
        total: this.famisGrid.totalRecordCount
      };
      this.dataLoading = false;
      return of(gridDataResult);
    } else {
      return of(<GridDataResult> {
        data: new Array(),
        total: 0
      });
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    if (this.unsortableFields.indexOf(sort[0].field) < 0) {
      const s = this;

      // Emit change right away to let consuming component handle
      s.sortChanged.emit(sort);

      this.sort = sort;

      const sortTerms = s.mapSortDto(sort);

      this.famisGridService.currentSort[this.famisGrid.gridId] = sortTerms;

      s.famisGridService
        .update(s.famisGrid.gridId, s.state.skip, s.state.take, s.famisGrid.totalRecordCount,
          s.famisGridService.currentSort[s.famisGrid.gridId], true)
        .pipe(takeUntil(s.destroyed$))
        .subscribe(result => {
          s.updateCacheEvent.emit(result);
        });

        s.userGridService.saveActiveSorts(this.gridSettingsName, s.state, sort)
          .subscribe(savedSetting => {
            s.userGridService.updateUserSettingsCache(savedSetting);
          });
    }
  }

  private mapSortDto(sort: SortDescriptor[]): Array<AssetSortTermDto> {
    const sortTerms = new Array<AssetSortTermDto>();

      const orderCount = 0;

      sort.forEach(c => {
        const sortTerm = <AssetSortTermDto>{
          termOrder: orderCount,
          sortDirection: c.dir === 'asc' ? 0 : 1,
          field: c.field
        };

        sortTerms.push(sortTerm);
      });
      return sortTerms;
  }

  private updateView(data: any[]) {
    if (this.gridData && this.gridData.length === 0 && data.length === 0) {
      this.dataLoading = false;
      return;
    }

    this.gridData = data;
    this.view = this.mapGridDataResult();
  }

  // ** Any type is intentional as the grid row can differ based on implementation
  public actionClicked(rowIndex: number, dataItem: any, action: string) {
    this.actionEvent.emit(<FamisGridActionEvent>{ rowIndex: rowIndex, item: dataItem, action: action });
  }

  public getColumnTitle(column: GridColumnHeader): string {
    return this.helperService.getColumnTitle(this.famisGrid.translationBaseKey, column);
  }

  pageChange(state: any): void {
    console.log('Page Change Event: Current S: '+ this.state.skip +' T: '+ this.state.take+ ' Event S: '+ state.skip + ' T: ' + state.take);
    this.dataStateChange(state);
  }
}
