import { ReconcileMatchService } from '../services/reconcile-match.service';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { UpsertAssetRecordComponent } from './upsert-asset-record.component';
import { ReconciliationInventoryService } from '../services/inventory.service';

import { ReconcileDataGridService } from '../services/reconcile-data-grid.service';
import { GridDataResult, SelectAllCheckboxState, GridComponent, SelectionEvent, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { HelperService } from '../../_core/services/helper.service';
import { ParentChildMatchDetailComponent } from './parent-child-match-detail.component';
import { ParentChildService } from '../services/parent-child.service';
import { SortDescriptor } from '@progress/kendo-data-query/dist/es/main';
import { AlertService } from '../../_core/services/alert.service';
import { AssetFileInfoService } from '../../_core/services/asset-file-info-service';
import { EditEvent } from '@progress/kendo-angular-grid';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { UserGridService } from '../../_core/services/user-grid.service';

import { UserStore } from '../../_core/user/user.store';
import { CopyAssetRecordComponent } from '../../_shared/components/copy-asset-modal/copy-asset-record.component';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectionChangeEvent } from '../../_models/selection-change-event.model';
import { MatchSelectionEvent } from '../../_models/match-selection-event.model';
import { Asset } from '../../_models/asset.model';
import { DataTargetName } from '../../_enums/data-target-name';
import { Subscription, Subject, forkJoin } from 'rxjs';
import { AssetFileSummaryDto } from '../../_api/dtos/asset-file-summary.dto';
import { FieldType } from '../../_enums/field-type';
import { State, CompositeFilterDescriptor, filterBy } from '@progress/kendo-data-query';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';
import { FieldOption } from '../../_models/field-option.model';
import { DataItemValue } from '../../_models/data-item-value.model';
import { ActivatedRoute, Router } from '@angular/router';
import { IntlService } from '@progress/kendo-angular-intl';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';
import { AssetDto } from '../../_api/_runtime/dtos/asset.dto';
import { FormField } from '../../_models/form-field.model';
import { ColumnAddedEvent } from '../../_models/column-added-event.model';
import { FieldMetaDataDto } from '../../_api/_runtime/dtos/field-meta-data.dto';
import { GridReorderEvent } from '../../_models/shared/famis-grid-reorder-event.model';

@Component({
  selector: 'reconcile-data-grid',
  templateUrl: './reconcile-data-grid.component.html'
})
export class ReconcileDataGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public formGroup: FormGroup;
  private editedRowIndex: string;

  @Input()
  dataSource: number;
  @Input()
  selectedRows: Array<string>;
  @Input()
  fileName: string;

  @Output()
  selectionChanged = new EventEmitter<SelectionChangeEvent>();
  @Output()
  matchSelected = new EventEmitter<MatchSelectionEvent>();
  @Output()
  parentChildSelected = new EventEmitter<Asset>();
  @Output()
  clearSelection = new EventEmitter<DataTargetName>();

  public sort: SortDescriptor[];

  public groupId: string;
  public loading: Subscription | boolean;
  public dataLoaded = false;

  public assetFileSummary = <AssetFileSummaryDto>{};

  public fieldTypes = FieldType;

  private gridScrollDebouncer: Subject<any> = new Subject();

  // TODO: Unsubscribe after ngOnDestroy
  public view: GridDataResult;

  public state: State = {
    skip: 0,
    take: this.reconcileDataGridService.windowSize
  };

  @ViewChild(GridComponent, {static: false})
  private grid: GridComponent;

  @ViewChild(UpsertAssetRecordComponent, {static: false})
  private upsertAssetRecord: UpsertAssetRecordComponent;

  @ViewChild('parentChildMatchDetail', {static: false})
  private parentChildMatchDetail: ParentChildMatchDetailComponent;

  @ViewChild(CopyAssetRecordComponent, {static: false})
  private copyAssetRecordComponent: CopyAssetRecordComponent;

  public assets = new Array<Asset>();
  public filterRoot: CompositeFilterDescriptor;
  public showEditRecord = false;
  public headers = new Array<GridColumnHeader>();
  public selectedHeaders = new Array<GridColumnHeader>();
  public updatedSelectedHeaders = new Array<string>();

  public dataTargetName = DataTargetName;

  public headersAvailable = new Array<GridColumnHeader>();

  public gridDataTotal = 0;

  public totalRecordCount = 0;

  public unsavedEdits: Array<Asset> = new Array<Asset>();

  public groupSiteInfo = new Array<CascadedSelectOption>();
  public groupDepartments = new Array<FieldOption>();
  public groupAccounts = new Array<FieldOption>();

  public expandedMatchIndex: number = null;

  public gridSettingsLoaded: boolean | undefined = undefined;
  public allMatched = false;
  public noFile = false;
  public hasCustomColumns = false;

  private isDebugMode = false;

  public selectableSettings = {
    checkboxOnly: false,
    mode: 'multiple'
  };

  public cascadedSelectedOption: Array<CascadedSelectOption> = new Array<CascadedSelectOption>();

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  public editedRecords = new Array<DataItemValue>();
  public editedRecordsWithErrors = new Array<DataItemValue>();

  gridSettingsName: string | undefined = undefined;
  userId: string | undefined = undefined;

  public selectAllState: SelectAllCheckboxState = 'unchecked';

  public allAssetIds = new Array<string>();
  public mappedColumns: String[];
  constructor(
    private reconcileMatchService: ReconcileMatchService,
    private reconcileDataService: ReconcileDataService,
    private reconcileDataGridService: ReconcileDataGridService,
    private inventoryService: ReconciliationInventoryService,
    private route: ActivatedRoute,
    private helperService: HelperService,
    private parentChildService: ParentChildService,
    private alertService: AlertService,
    private assetFileInfoService: AssetFileInfoService,
    private intl: IntlService,
    private famisGridService: FamisGridService,
    private userGridService: UserGridService,
    private router: Router,
    private userStore: UserStore
  ) {}

  ngOnInit() {
    const s = this;

    this.gridSettingsName = this.userGridService.createUserGridId(this.dataSource.toString(), this.router.url.toString());

    this.loading = true;

    this.groupId = this.route.parent.parent.snapshot.paramMap.get('groupId');

    this.reconcileDataGridService.groupId = this.groupId;

    const defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'SerialNumber' }];

    this.reconcileDataGridService.toggleShowMatchedRecords(true, this.dataSource);

    this.editedRecords = new Array<DataItemValue>();

    this.famisGridService.editedRecords$.subscribe(editedRecords => {
      this.editedRecords = editedRecords;
    });

    this.editedRecordsWithErrors = new Array<DataItemValue>();

    this.famisGridService.editedRecordsWithErrors$.subscribe(editedRecordsWithErrors => {
      this.editedRecordsWithErrors = editedRecordsWithErrors;
    });

    const getInventoryRecords = this.reconcileDataGridService.search(
      this.groupId,
      this.dataSource,
      this.state.skip,
      this.state.take,
      defaultSortTerms,
      this.reconcileDataGridService.filterTerms[this.dataSource],
      true
    );

    const getActivityCodes = this.reconcileDataGridService.getActivityCodes();

    const getAssetFileSummary = this.inventoryService.getAssetFileSummary(this.groupId, this.dataSource);

    this.reconcileDataGridService.clearSelections$.subscribe(result => {

      this.selectAllState = 'unchecked';

    });

    forkJoin(getInventoryRecords, getAssetFileSummary, getActivityCodes)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        ([inventoryRecords, assetFileSummary, activityCodes]) => {
          this.assetFileSummary = assetFileSummary;

          if (!!this.assetFileSummary && this.dataSource === DataTargetName.client) {
            this.hasCustomColumns = assetFileSummary.fields.findIndex(f => f.isCustom === true) !== -1;
          }

          this.assets = this.reconcileDataGridService.init(inventoryRecords, this.dataSource);
          this.reconcileDataGridService.setCacheRecords(this.assets, this.dataSource, this.state.skip, this.totalRecordCount);
          this.assetFileInfoService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');
          this.assets = this.assetFileInfoService.mapEnums(
            null,
            this.assets.map(asset => {
              return asset;
            }),
            null
          );

          this.reconcileDataGridService.updateRecordCount(this.dataSource, inventoryRecords.totalInRecordSet);
          this.totalRecordCount = inventoryRecords.totalInRecordSet;

          this.view = this.mapGridDataResult();

          this.headersAvailable =
            this.helperService
              .mapHeaders(
                assetFileSummary.fields,
                this.assetFileInfoService.GetInternalColumns(),
                this.reconcileDataGridService.defaultHeaders
              );

          const defaultSort = true;

          this.reconcileDataGridService.updateHeaders(this.headersAvailable, this.dataSource, defaultSort);

          this.dataLoaded = inventoryRecords.totalInRecordSet > 0;

          this.allAssetIds = inventoryRecords.allAssetIds;

          this.userStore.user.subscribe(user => {
            this.userId = user.profile.IdentityId.toString();
            this.gridSettingsName = this.userId + this.gridSettingsName + this.dataTargetName;
            this.userGridService
              .getSettings(
                this.userId,
                this.gridSettingsName,
                this.reconcileDataGridService.defaultHeaders.map(c => c.name))
                .subscribe(result => {
                  s.gridSettingsLoaded = true;
                  s.state.filter = result.filters ? result.filters : null;
                  if (result.gridSort) {
                    s.sort = result.gridSort;
                    s.state.sort = result.gridSort;
                    s.reconcileDataGridService.currentSort[this.dataSource] = s.mapSortDto(result.gridSort);
                  }
                  s.reconcileDataGridService.updateSelectedHeaders(result.headers, this.dataSource);
                  if (result.filters) {
                    s.state.filter = result.filters;
                  }
                  if ((result.filters && result.gridSort) || result.filters) {
                    s.filterChange(result.filters);
                  } else if (!result.filters && result.gridSort) {
                    s.sortChange(result.gridSort);
                  }
                  this.userGridService.saveSettings(
                    this.gridSettingsName,
                    result.headers,
                    this.groupId,
                    this.userId,
                    result.kendoGridState ? result.kendoGridState : null,
                    result.filters ? result.filters : null,
                    result.columnSizes ? result.columnSizes : null,
                    result.gridSort ? result.gridSort : null
                  ).subscribe(updatedSetting => this.userGridService.updateUserSettingsCache(updatedSetting));
                });
          });
          this.allMatched = inventoryRecords.totalInRecordSet === 0;
          this.loading = false;
        },
        error => {
          this.noFile = true;
          this.loading = false;
        }
      );

    this.reconcileDataGridService.selectedHeaders$.subscribe(result => {
      if (result) {
        this.updatedSelectedHeaders = result[s.dataSource];
        this.headers = this.headersAvailable.filter(function(x) {
          return result[s.dataSource].some(c => c === x.name);
        });

        let order = 0;
        result[s.dataSource].forEach(headerName => {
          const index = this.headers.findIndex(c => c.name === headerName);

          if (index !== -1) {
            this.headers[index].order = order++;
          }
        });
      }
    });

    this.reconcileDataGridService.unsavedEdits$.subscribe(unsavedEdits => {
      if (unsavedEdits[this.dataSource]) {
        this.unsavedEdits = unsavedEdits[this.dataSource];
      }
    });

    this.assetFileInfoService.getImportMappedColumns(this.reconcileDataGridService.groupId)
    .subscribe(
     result => {
       const userSettingdto = result;
       const index = 0;
       if (userSettingdto.length > 0 && userSettingdto[index].settingJson) {
         this.mappedColumns = userSettingdto[index].settingJson.importMappedColumns;
       }
     }
   );

    this.showEditRow();

    this.filterRoot = { logic: 'and', filters: [] };

    // Filter out Parent/Child matches
    this.filterRoot.filters.push({
      field: 'isChild',
      operator: 'eq',
      value: false
    });

    // this.showMatchedRecords(false);
    this.collapseParentChild();

    this.gridScrollDebouncer.pipe(debounceTime(500))
    .subscribe(event => {
      this.processPageChange(event);
    });

    this.reconcileDataService.groupSiteInfo$.subscribe(groupSiteInfo => {
      this.groupSiteInfo = groupSiteInfo;
    });

    this.reconcileDataService.groupDepartmentInfo$.subscribe(departments => {
      this.groupDepartments = departments;
    });

    this.reconcileDataService.groupAccountInfo$.subscribe(accounts => {
      this.groupAccounts = accounts;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  public isDirty(): boolean {
    return this.editedRecords.length + this.editedRecordsWithErrors.length !== 0;
  }

  public duplicateRecord(): void {
    const assetToDuplicate = this.assets.find(c => c.assetId === this.selectedRows[0]);

    if (assetToDuplicate) {
      assetToDuplicate.assetId = null;

      this.upsertAssetRecord.openCreateModal(this.groupId, this.dataSource, assetToDuplicate);
      this.upsertAssetRecord.AssetUpsertComplete.subscribe(() => {
        this.clearSelection.emit(this.dataSource);
        this.updateCurrentView(true);
      });
    }
  }

  public onSelectedKeysChange(e) {
    const len = this.selectedRows.length;

    if (len === 0) {
      this.selectAllState = 'unchecked';
    } else if (len > 0 && len < this.totalRecordCount) {
      this.selectAllState = 'indeterminate';
    } else {
      this.selectAllState = 'checked';
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    if (checkedState === 'checked') {
      this.selectedRows = this.allAssetIds;
      this.selectAllState = 'checked';
    } else {
      this.selectedRows = [];
      this.selectAllState = 'unchecked';
    }
  }

  public gridSelectionChange(event: SelectionEvent) {

    if (this.selectAllState === 'unchecked') {
      const selectedAssets = new Array<Asset>();

      this.allAssetIds.forEach(id => {
        selectedAssets.push(<Asset>{ assetId: id, dataSource: this.dataSource});
      });

      const selectionChangeEvent = <SelectionChangeEvent>{
        dataSource: this.dataSource,
        itemsAdded: new Array<Asset>(),
        itemsRemoved: selectedAssets
      };

      this.selectionChanged.emit(selectionChangeEvent);
    }

    if (this.selectAllState === 'checked') {
      const selectedAssets = new Array<Asset>();

      this.allAssetIds.forEach(id => {
        selectedAssets.push(<Asset>{ assetId: id, dataSource: this.dataSource});
      });

      const selectionChangeEvent = <SelectionChangeEvent>{
        dataSource: this.dataSource,
        itemsAdded: selectedAssets,
        itemsRemoved: new Array<Asset>()
      };

      this.selectionChanged.emit(selectionChangeEvent);
    }

    if (this.selectAllState !== 'checked') {
      const selectionChangeEvent = <SelectionChangeEvent>{
        dataSource: this.dataSource,
        itemsAdded: <Asset[]>event.selectedRows.map(c => c.dataItem),
        itemsRemoved: <Asset[]>event.deselectedRows.map(c => c.dataItem)
      };

      this.selectionChanged.emit(selectionChangeEvent);
    }
  }

  public rowCallback = (context: any) => {
    const id = context.dataItem.id;

    let classes = '';

    if (this.editedRecordsWithErrors && this.editedRecordsWithErrors.findIndex(c => c.itemId === id) !== -1) {
      classes = 'withErrors ';
    }

    if (this.editedRecords && this.editedRecords.findIndex(c => c.itemId === id) !== -1) {
      classes = classes + 'editedRow ';
    }

    if (context.dataItem.isMatched) {
      classes = classes + 'isMatched ';
    }

    if (!context.dataItem.isMatched) {
      classes = classes + 'isNotMatched ';
    }

    if (context.dataItem.isParent) {
      classes = classes + 'isParent ';
    }

    if (context.dataItem.isEdited) {
      classes = classes + 'isEdited ';
    }

    return classes;
  }

  public getHeaders(obj) {
    const keys = Object.keys(obj).map(key => {
      return { key: key };
    });

    return keys;
  }

  public saveEdits(): void {
    let updateCount = 0;

    this.unsavedEdits.forEach(asset => {
      let assetDto = <AssetDto>{ id: asset.assetId };

      delete asset.assetId;
      delete asset.dataSource;
      delete asset.isChild;
      delete asset.isEdited;
      delete asset.isParent;
      delete asset.isMatched;
      delete asset.imageCollection;

      assetDto = Object.assign(assetDto, asset);

      this.inventoryService.updateAssetRecord(assetDto.id, assetDto).subscribe(
        result => {
          if (result) {
            updateCount = updateCount + 1;
          }
        },
        error => {
          this.updateCurrentView(true);
          this.alertService.error(`Invalid data entered and data cannot be saved`);
        },
        () => {}
      );
    });

    this.alertService.success(`${updateCount} Assets Updated`);

    this.updateCurrentView(true);
  }

  public clearEdits(): void {
    this.reconcileDataGridService.clearEditInProgress(this.dataSource);
    this.updateCurrentView(true);
  }

  public editClick({ sender, rowIndex, columnIndex, dataItem, isEdited, originalEvent }) {
    const header = this.headers[columnIndex - 4];

    if (!isEdited && this.isEditable(header)) {
      const fields = new Array<FormField>();

      this.headers.forEach(h => {
        fields.push(<FormField>{ id: h.name, displayName: h.displayName });
      });

      this.formGroup = this.helperService.toFormGroup(fields);

      this.formGroup.patchValue(this.famisGridService.mapToTypedValues(dataItem, this.headers));

      sender.editCell(rowIndex, columnIndex, this.formGroup);
    }
  }

  public cellCloseHandler(args: any) {
    const { formGroup, dataItem } = args;

    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      const currentAsset = this.assets.find(c => c.assetId === dataItem.assetId);

      if (currentAsset) {
        // tslint:disable-next-line:prefer-const
        let updatedAsset = JSON.parse(JSON.stringify(Object.assign(currentAsset, formGroup.value)));

        updatedAsset.id = updatedAsset.assetId;

        delete updatedAsset.assetId;
        delete updatedAsset.isParent;
        delete updatedAsset.isMatched;
        delete updatedAsset.isChild;
        delete updatedAsset.dataSource;
        delete updatedAsset.imageCollection;

        this.famisGridService.addEditedRecord(updatedAsset.id, updatedAsset);
      }
    }
  }

  public inGridSave() {
    const resultToSave = JSON.parse(JSON.stringify(this.editedRecords));

    console.log(event, 'handleCellValueChanged');

    resultToSave.forEach(editItem => {
      delete editItem.dataItem.assetId;
      delete editItem.dataItem.isParent;
      delete editItem.dataItem.isMatched;
      delete editItem.dataItem.isChild;
      delete editItem.dataItem.dataSource;
      delete editItem.dataItem.imageCollection;
      delete editItem.dataItem.assetImages;

      this.inventoryService.updateAssetRecord(editItem.itemId, editItem.dataItem).subscribe(
        result => {
          if (result) {
            this.updateCurrentView(true);

            this.alertService.success('Asset(s) edited successfuly');

            this.famisGridService.removeEditedRecord(editItem.itemId);
            this.famisGridService.removeRecordWithErrors(editItem.itemId);
          }
        },
        error => {
          this.updateCurrentView(true);
          this.alertService.error('Invalid data entered and data cannot be saved');
        },
        () => {}
      );
    });
  }

  public toggleParentChildMatch(asset: Asset, rowIndex?: number) {
    this.collapseParentChild();

    this.reconcileMatchService.getMatchSummaryForAssetIds(this.groupId, [asset.assetId]).subscribe(x => {
      const currentChildren = new Array<Asset>();

      x.result.assetData
        .filter(c => !!c.parentId && c.isParent === false)
        .forEach(child => {
          const a = <Asset>{
            assetId: child.id,
            oldTagNumber: child.oldTagNumber,
            description: child.description,
            parentId: child.parentId,
            assetTagNumber: child.assetTagNumber,
            serialNumber: child.serialNumber,
            modelNumber: child.modelNumber,
            buildingName: child.buildingName,
            quantity: child.quantity,
            historicalCost: child.historicalCost
          };
          currentChildren.push(a);
        });

      this.parentChildService.setChildren(currentChildren);
    });

    if (asset.isParent) {
      if (this.expandedMatchIndex === null || rowIndex !== this.expandedMatchIndex) {
        this.grid.expandRow(rowIndex);
        this.expandedMatchIndex = rowIndex;
      } else {
        this.collapseParentChild(true);
      }
    } else {
      // Current is not Parent/Child
      this.collapseParentChild(true);
    }

    this.parentChildSelected.emit(asset);
  }

  public showMatchForAsset(asset: Asset) {
    this.collapseParentChild();

    const event = <MatchSelectionEvent>{ dataSource: this.dataSource, asset: asset };

    this.matchSelected.emit(event);
  }

  public openAddRecord() {
    this.upsertAssetRecord.openCreateModal(this.groupId, this.dataSource);
    this.upsertAssetRecord.AssetUpsertComplete.subscribe(() => {
      this.updateCurrentView();
    });
  }

  public openEditRecordForm(asset: Asset) {
    this.upsertAssetRecord.openEditModal(this.groupId, this.dataSource, asset);
    this.upsertAssetRecord.AssetUpsertComplete.subscribe(() => {
      this.updateCurrentView();
    });
  }

  public updateCurrentView(clearCache: boolean = false) {
    const s = this;

    this.loading = true;

    this.reconcileDataGridService
      .update(
        this.dataSource,
        this.state.skip,
        this.state.take,
        this.totalRecordCount,
        this.reconcileDataGridService.currentSort[this.dataSource],
        clearCache)
      .subscribe(result => {
        this.loading = false;
        if (result && result.assets.length > 0 && result.assets[0].dataSource === this.dataSource) {
          this.dataLoaded = result.assets.length > 0;
          this.assets = result.assets;
          this.totalRecordCount = result.totalInRecordSet;
          this.allAssetIds = result.allAssetIds;
          this.assets.map(asset => {
            asset.imageCollection = !!asset.assetImages ? asset.assetImages : [];
          });
          this.assets = this.assetFileInfoService.mapEnums(
            null,
            this.assets.map(asset => {
              return asset;
            }),
            null
          );
          this.view = s.mapGridDataResult();
        } else {
          this.assets = new Array<Asset>();
          this.view = s.mapGridDataResult();
        }
      });
  }

  public callGridScrollDebouncer(event) {
    this.gridScrollDebouncer.next(event);
  }

  showMatchedRecords(showMatches: boolean) {
    if (showMatches) {
      this.allMatched = false;
    }
    this.reconcileDataGridService.toggleShowMatchedRecords(!showMatches, this.dataSource);

    this.updateCurrentView(true);
  }

  public sortChange(sort: SortDescriptor[]): void {
    const s = this;
    this.sort = sort;
    this.state.sort = sort;
    this.loading = true;

    this.userGridService.saveActiveSorts(
      this.gridSettingsName,
      this.state,
      sort
    );

    const sortTerms = s.mapSortDto(sort);

    this.reconcileDataGridService
      .update(
        this.dataSource,
        this.state.skip,
        this.state.take,
        this.totalRecordCount,
        sortTerms,
        true).subscribe(
          result => {
            this.loading = false;
            if (result.assets.length > 0 && result.assets[0].dataSource === this.dataSource) {
              this.assets = result.assets;
              this.totalRecordCount = result.totalInRecordSet;
              this.assets = this.assetFileInfoService.mapEnums(
                null,
                this.assets.map(asset => {
                  return asset;
                }),
                null
              );
              this.view = s.mapGridDataResult();
            }
          }
        );
  }

  public filterGrid() {
    // TODO: Revisit this
    this.collapseParentChild(true);
    this.showEditRow();
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

  public filterChange(filter: CompositeFilterDescriptor) {
    this.loading = true;
    this.state.filter = filter;
    let filterCleared = false;

    if (this.state.filter.filters.length === 0) {
      filterCleared = true;
    }

    // persist the filters
    this.userGridService
      .saveActiveFilters(this.gridSettingsName,
        this.state,
        filter);

    this.reconcileDataGridService.mapFilterTerms(filter, this.dataSource).subscribe(filterTerms => {
      if (filterTerms === true) {
        this.reconcileDataGridService
          .search(
            this.groupId,
            this.dataSource,
            this.state.skip,
            this.state.take,
            this.reconcileDataGridService.currentSort[this.dataSource],
            this.reconcileDataGridService.filterTerms[this.dataSource]
          )
          .pipe(takeUntil(this.destroyed$))
          .subscribe(result => {
            this.assets = this.reconcileDataGridService.init(result, this.dataSource);
            this.totalRecordCount = result.totalInRecordSet;
            this.assets = this.assetFileInfoService.mapEnums(
              null,
              this.assets.map(asset => {
                return asset;
              }),
              null
            );
            this.view = this.mapGridDataResult();
            this.loading = false;
            this.allAssetIds = result.allAssetIds;
          });
      } else {
        this.updateCurrentView(true);
      }
    });
  }

  public showColumn(columnKey: string): boolean {
    const hideColumn =
      this.reconcileDataService.defaultColumns
        .indexOf(columnKey) !== -1 || this.assetFileInfoService.GetInternalColumns().indexOf(columnKey) !== -1;
    return hideColumn;
  }

  public onAssetFileColumnsAdded(event: ColumnAddedEvent) {
    const s = this;

    if (event.columns && event.columns.length > 0) {
      event.columns.forEach(col => {
        this.reconcileDataGridService.addHeader(col.columnName, event.dataSource);
      });

      const clearCache = true;

      this.updateCurrentView(clearCache);

      this.inventoryService.getAssetFileSummary(this.groupId, this.dataSource).subscribe(assetFileSummary => {
        this.headersAvailable =
          this.helperService.mapHeaders(
            assetFileSummary.fields,
            this.assetFileInfoService.GetInternalColumns(),
            this.reconcileDataGridService.defaultHeaders);

        this.reconcileDataGridService.updateHeaders(this.headersAvailable, this.dataSource, true);

        this.headers = this.headersAvailable.filter(function(x) {
          return s.updatedSelectedHeaders.some(c => c === x.name);
        });
      });
    }
  }

  public convertToNumber(value: string): Number {
    return parseFloat(value);
  }

  public getColumnTitle(column: GridColumnHeader): string {
    return this.helperService.getColumnTitle(this.i18n.asset, column);
  }

  private processPageChange(state: DataStateChangeEvent): void {
    const s = this;
    s.loading = true;

    s.reconcileDataGridService
      .update(this.dataSource, state.skip, state.take, s.totalRecordCount, s.reconcileDataGridService.currentSort[s.dataSource], true)
      .subscribe(result => {
          s.loading = false;
          result.assets = this.assetFileInfoService.mapEnums(
            null,
          result.assets.map(asset => {
              return asset;
            }),
            null
          );
          if (result.assets.length > 0 && result.assets[0].dataSource === s.dataSource) {
            s.assets = result.assets;
            s.view = s.mapGridDataResult();
          } else {
            s.assets = new Array<Asset>();
            s.view = s.mapGridDataResult();
          }
        }
      );
  }

  private isEditable(dataItem: GridColumnHeader) {
    return dataItem &&
      (
        (dataItem.name !== 'buildingName' && this.dataSource === DataTargetName.inventory) ||
        (this.dataSource === DataTargetName.client && dataItem.isCustom)
      );
  }

  private isCustomField(field: string): boolean {
    return this.headers.find(c => c.name === field).isCustom;
  }

  private mapHeaders(fields: FieldMetaDataDto[]): GridColumnHeader[] {
    const s = this;
    const columnHeadings = new Array<GridColumnHeader>();

    fields.forEach(field => {
      const columnHeading = <GridColumnHeader>{
        name: field.name,
        displayName: field.displayName,
        isSearchable: field.isSearchable,
        isFilterable: field.isFacetable,
        isSortable: field.isSortable,
        isFacetable: field.isFacetable,
        isKey: field.isKey,
        isCustom: field.isCustom,
        fieldType: this.mapKendoFilterType(field.fieldType),
        format: s.mapHeaderFormat(field)
      };

      columnHeadings.push(columnHeading);
    });

    return columnHeadings;
  }

  private mapGridDataResult(recordCount?: number): GridDataResult {
    const assets = this.mapEdits(this.assets);

    const gridDataResult = <GridDataResult>{
      data: filterBy(assets, this.filterRoot),
      total: this.totalRecordCount
    };

    return gridDataResult;
  }

  public collapseParentChild(clearIndex?: boolean) {
    if (this.grid) {
      this.grid.collapseRow(this.expandedMatchIndex);
    }

    if (clearIndex) {
      this.expandedMatchIndex = null;
    }
  }

  private showEditRow() {
    if (this.assetFileSummary.fields && this.dataSource === DataTargetName.client) {
      this.showEditRecord = this.assetFileSummary.fields.findIndex(f => f.isCustom === true) !== -1;
    } else {
      this.showEditRecord = true;
    }
  }

  public onAssetModified($event) {
    this.updateCurrentView();
  }

  public onColumnReorder(event: any) {
    event.preventDefault();


    const reorderEvent: GridReorderEvent = event;

    // Determine which way to start indexes so always positive
    const increaseOrder = reorderEvent.oldIndex > reorderEvent.newIndex;
    let startIndex = this.updatedSelectedHeaders.indexOf(reorderEvent.column.field);
    let endIndex =
      increaseOrder ? startIndex - (reorderEvent.oldIndex - reorderEvent.newIndex)
      : startIndex + (reorderEvent.newIndex - reorderEvent.oldIndex);

    if (increaseOrder) {
      const temp = startIndex;
      startIndex = endIndex;
      endIndex = temp;
    }

    // ReOrder Column to precede a locked column (eg actions, selection)
    if (startIndex < 0) {
      return;
    }

    // Find the selected column and update it with the destinations column's order value
    if (increaseOrder) {
      this.headersAvailable
        .filter(x => x.name === this.updatedSelectedHeaders[endIndex])
          [0].order = this.headersAvailable
          .filter(x => x.name === this.updatedSelectedHeaders[startIndex])[0].order;
    } else {
      this.headersAvailable
        .filter(x => x.name === this.updatedSelectedHeaders[startIndex])
          [0].order = this.headersAvailable
          .filter(x => x.name === this.updatedSelectedHeaders[endIndex])[0].order;
    }

    // Iterate over all columns between the selcted start and end, and update they're value to increase or decrease by 1
    this.updatedSelectedHeaders.slice(increaseOrder ? startIndex : startIndex + 1, increaseOrder ? endIndex : endIndex + 1)
      .forEach(item => {
        this.headersAvailable.filter(x => x.name === item)[0].order = increaseOrder
          ? this.headersAvailable.filter(x => x.name === item)[0].order + 1
          : this.headersAvailable.filter(x => x.name === item)[0].order - 1;
      }
    );

    // Update the order of the selected headers, so they can match the next time around a reorder is done
    let i = 0;
    this.updatedSelectedHeaders.slice(increaseOrder ? startIndex : startIndex + 1, increaseOrder ? endIndex : endIndex + 1)
      .forEach(item => {
        if (increaseOrder) {
          const temp = this.updatedSelectedHeaders[endIndex - i];
          this.updatedSelectedHeaders[endIndex - i] = this.updatedSelectedHeaders[endIndex - i - 1];
          this.updatedSelectedHeaders[endIndex - i - 1] = temp;
        } else {
          const temp = this.updatedSelectedHeaders[startIndex + i];
          this.updatedSelectedHeaders[startIndex + i] = this.updatedSelectedHeaders[startIndex + i + 1];
          this.updatedSelectedHeaders[startIndex + i + 1] = temp;
        }
        i = i + 1;
      }
    );

    // Update the headers and selected headers
    this.reconcileDataGridService.updateHeaders(this.headersAvailable, this.dataSource);
    this.reconcileDataGridService.updateSelectedHeaders(this.updatedSelectedHeaders, this.dataSource);

    this.loading = true;
    this.userGridService.saveSettings(this.gridSettingsName, this.updatedSelectedHeaders, this.groupId, this.userId).subscribe(
      saveResult => {
        /*  .getSettings(this.userId, this.gridSettingsName, this.reconcileDataGridService.defaultHeaders.map(c => c.name))
        .subscribe */

        this.userGridService.getSettings(
          this.userId,
          this.gridSettingsName,
          this.reconcileDataGridService.defaultHeaders
          .map(c => c.name)).subscribe(
            updateResult => {
              this.loading = false;
            },
            () => {
              this.alertService.error('Error saving columns update');
              this.loading = false;
            }
          );
        },
        () => {
          this.alertService.error('Error saving columns update');
          this.loading = false;
        }
      );
    }

  navigateToImportData(event: any): void {
    event.preventDefault();
    this.router.navigate([`project-profile/${this.groupId}/DataImport`]);
  }

  public editHandler({ sender, rowIndex, dataItem }: EditEvent): void {
    if (this.formGroup && !this.formGroup.valid) {
      return;
    }

    const fields = new Array<FormField>();

    this.headers.forEach(header => {
      fields.push(<FormField>{ id: header.name, type: FieldType.String, displayName: header.displayName });
    });

    // this.saveRow();
    this.formGroup = this.helperService.toFormGroup(fields);
    this.editedRowIndex = dataItem.id;
    sender.editRow(rowIndex, this.formGroup);
  }

  public toKendoDate(dateString: string): Date {
    return this.intl.parseDate(dateString);
  }

  private mapEdits(assets: Array<Asset>): Array<Asset> {
    this.unsavedEdits.forEach(unsavedEdit => {
      const index = this.assets.findIndex(c => c.assetId === unsavedEdit.assetId);

      if (index !== -1) {
        const assetWithEdits = Object.assign(assets[index], unsavedEdit);
        this.assets[index] = assetWithEdits;
      }
    });

    return assets;
  }

  private mapHeaderFormat(header: FieldMetaDataDto): string {
    switch (header.fieldType) {
      case FieldType.Integer: {
        return '{0}';
      }

      case FieldType.Double: {
        return '{0:c}';
      }

      case FieldType.DateTime: {
        return '{0:d}';
      }

      default: {
        return '{0}';
      }
    }
  }

  private mapKendoFilterType(fieldType: FieldType): string {
    switch (fieldType) {
      case FieldType.String:
        return 'string';
      case FieldType.DateTime:
        return 'date';
      case FieldType.Double:
        return 'numeric';
      case FieldType.Integer:
        return 'numeric';
      case FieldType.String:
        return 'string';
      default:
        return 'numeric';
    }
  }

  mapFieldTypes(dataItem: Asset): Asset {
    const props = Object.keys(dataItem);

    const dateHeaders = this.headers.filter(c => c.fieldType === 'date');

    const numericHeaders = this.headers.filter(c => c.fieldType === 'numeric');
    props.forEach(property => {
      if (dateHeaders.findIndex(c => c.name === property) !== -1) {
        const date = this.intl.parseDate(dataItem[property]);

        dataItem[property] = date;
      }

      if (numericHeaders.findIndex(c => c.name === property) !== -1) {
        dataItem[property] = this.intl.parseNumber(dataItem[property], 'n2');
      }
    });

    return dataItem;
  }
}
