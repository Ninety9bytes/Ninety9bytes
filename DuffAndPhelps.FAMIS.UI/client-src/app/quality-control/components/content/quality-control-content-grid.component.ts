import { SortDescriptor } from '@progress/kendo-data-query/dist/es/main';
import { QualityControlService } from '../../services/quality-control.service';
import { FieldType } from '../../../_api/_runtime/enums/field-type';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { HelperService } from '../../../_core/services/helper.service';
import { FamisGridComponent } from '../../../_shared/components/famis-grid.component';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { AlertService } from '../../../_core/services/alert.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { Asset } from '../../../_models/asset.model';
import { State } from '@progress/kendo-data-query';
import { Subject, forkJoin, Subscription } from 'rxjs';
import { ReconciliationInventoryService } from '../../../reconciliation/services/inventory.service';
import { Router } from '@angular/router';
import { DataTargetName } from '../../../_enums/data-target-name';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';
import { SelectionChangeEvent } from '../../../_models/selection-change-event.model';
import { DataItemValue } from '../../../_models/data-item-value.model';
import { FamisGridActionEvent } from '../../../_models/shared/famis-grid-action-event.model';
import { AssetSortTermDto } from '../../../_api/dtos/inventory/asset-search.dto';
import { EnumDto } from '../../../_api/_configuration/dtos/enum.dto';
import { FilterSourceEnum } from '../../../_api/_configuration/enums/filterSource.enum';

@Component({
  selector: 'quality-control-content-grid',
  templateUrl: './quality-control-content-grid.component.html'
})
export class QualityControlContentGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public dataGrid: FamisGrid;
  public selectedAssets = new Array<Asset>();
  public sort: SortDescriptor[];
  public state: State;
  public enumDtos = new Array<EnumDto>();
  private destroyed$ = new Subject<any>();

  @Output()
  gridSelections = new EventEmitter<Array<Asset>>();

  @ViewChild(FamisGridComponent, {static: false})
  famisGrid: FamisGridComponent;

  @Input()
  isReadOnly = true;

  constructor(
    private qualityControlService: QualityControlService,
    private famisGridService: FamisGridService,
    private helperService: HelperService,
    private assetFileInfoService: AssetFileInfoService,
    private inventoryService: ReconciliationInventoryService,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit() {

    this.famisGridService.clearEditedRecords();


    this.state = {
      skip: 0,
      take: 84
    };

    this.dataGrid = <FamisGrid>{
      height: 600,
      gridId: this.famisGridService.createGrid(),
      totalRecordCount: 0,
      name: this.qualityControlService.dataTarget === DataTargetName.inventory ? 'Actual Inventory' : 'Consolidated File',
      dataSource: this.qualityControlService.dataTarget,
      supportedOperators: [
        FamisGridFeature.MultiSelectable,
        FamisGridFeature.ColumnSelection,
        FamisGridFeature.Sort,
        FamisGridFeature.InGridEditable,
        FamisGridFeature.Filter
      ],
      actions: this.isReadOnly ? ['View', 'Image'] : ['Edit', 'Image'],
      translationBaseKey: this.i18n.asset,
      defaultSort: [<SortDescriptor>{field: 'displayId', dir: 'asc'}]
    };

    this.famisGridService.setUserId();
    const getActivityCodes = this.qualityControlService.getActivityCodes();

    const getDepreciationConventions = this.qualityControlService.getDepreciationConventions();

    const getDepreciationMethods = this.qualityControlService.getDepreciationMethods();

    const getSearchMetadataByGroupId = this.qualityControlService.getSearchMetadataByGroupId(
      this.qualityControlService.groupId,
      this.qualityControlService.dataTarget
    );

    this.dataGrid.loading = forkJoin(getActivityCodes, getDepreciationConventions, getDepreciationMethods, getSearchMetadataByGroupId)
    .subscribe(([activityCodes, depreciationConventions, depreciationMethods, searchMetadata]) => {
      searchMetadata.fields.forEach(field => {
        if (field.name.indexOf('assetImages') > -1) {
          field.fieldType = FieldType.Image;
        }
      });
      this.enumDtos.push(activityCodes.result, depreciationConventions.result, depreciationMethods.result);
      this.qualityControlService.assetFileSummary = searchMetadata;
      this.dataGrid.fileId = searchMetadata.id;
      this.dataGrid.columnHeaders = this.helperService.mapHeaders(searchMetadata.fields, this.assetFileInfoService.GetInternalColumns(), undefined, this.enumDtos);
      this.dataGrid.selectedHeaders = this.assetFileInfoService.GetDefaultColumns();

      this.assetFileInfoService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');
      this.assetFileInfoService.updateReferenceData(depreciationConventions.result.enumOptions, 'DepreciationConventions');
      this.assetFileInfoService.updateReferenceData(depreciationMethods.result.enumOptions, 'DepreciationMethods');
    });
  }
    ngOnDestroy(): void {
    this.destroyed$.next();
  }

  updateCache(request?: FamisGridCacheResult) {
    const s = this;

    this.dataGrid.loading = s.processCacheUpdate(request);
    this.dataGrid.cacheLoading = this.dataGrid.loading;
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

  handleCellValueChanged(result: Array<DataItemValue>) {

    const resultToSave = JSON.parse(JSON.stringify(result));

    resultToSave.forEach(editItem => {
      delete editItem.dataItem.imageCollection;

      this.inventoryService.updateAssetRecord(editItem.itemId, <AssetDto>editItem.dataItem)
        .subscribe(() => {
          this.alertService.success('Asset(s) edited successfully');

          this.famisGridService.removeEditedRecord(editItem.itemId);
          this.famisGridService.removeRecordWithErrors(editItem.itemId);
        },
          error => {
            this.alertService.error(!!error.error ? error.error : 'An error has occurred saving the asset');

            this.famisGridService.addRecordsWithErrors(editItem.itemId, editItem.dataItem);
          }
        );
    });
  }

  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Edit':
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/EditContent/${event.item.id}`]);
        break;

      case 'View':
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/ViewContent/${event.item.id}`]);
        break;

      default:
        break;
    }
  }

  // TODO Consider moving this method to the famis shared grid service
  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    this.selectedAssets = new Array<Asset>();

    if (this.famisGrid) {
      this.famisGrid.selectedRows = [];
    }

    return this.qualityControlService
      .updateData(
        s.qualityControlService.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
        cacheUpdateRequest ? cacheUpdateRequest.sortTerms : s.famisGridService.currentSort[this.dataGrid.gridId],
        cacheUpdateRequest ? cacheUpdateRequest.filters : null,
        FilterSourceEnum.QualityControlGrid
      )
      .subscribe(dto => {
        this.dataGrid.totalRecordCount = dto.totalInRecordSet;
        s.famisGridService.setCacheRecords(
          this.assetFileInfoService.mapEnums(
            dto.assets.map(asset => {
              asset.assetData.imageCollection = !!asset.assetData.assetImages ? asset.assetData.assetImages : [];
              return asset.assetData;
            })
          ),
          s.dataGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.totalInRecordSet,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake
        );
        this.famisGrid.dataLoading = false;
      },
      error => {
        if (error['error']) {
          if(error['error'] === 'Unable to filter records') 
            this.alertService.error('unabletofilterrecords');
          else if(error['error'] === 'Unable to sort records')
            this.alertService.error('unabletosortrecords');          
        }
        else
            this.alertService.error('anunexpectederrorhasoccurred.');    
      });
  }

  handleSortChanged(sort: SortDescriptor[]) {
    const s = this;
    this.sort = sort;
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

    this.famisGridService.currentSort[this.dataGrid.gridId] = sortTerms;

    s.famisGridService
      .update(
        s.dataGrid.gridId,
        s.state.skip,
        s.state.take,
        s.dataGrid.totalRecordCount,
        s.famisGridService.currentSort[s.dataGrid.gridId],
        true
      )
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        s.updateCache(result);
      });
  }
}
