import { QualityControlService } from '../../services/quality-control.service';
import { SortDescriptor } from '@progress/kendo-data-query/dist/es/main';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { AlertService } from '../../../_core/services/alert.service';
import { HelperService } from '../../../_core/services/helper.service';
import { BuildingInfoService } from '../../../_core/services/building-info-service';
import { ViewMapComponent } from '../../../_shared/components/grid-actions/view-map.component';
import { BuildingsService } from '../../services/buildings.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { takeUntil } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Output, EventEmitter, Input, ViewContainerRef, ViewChild } from '@angular/core';
import { BuildingDto } from '../../../_api/_runtime/dtos/building.dto';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { State } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { DataTargetName } from '../../../_enums/data-target-name';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';
import { SelectionChangeEvent } from '../../../_models/selection-change-event.model';
import { DataItemValue } from '../../../_models/data-item-value.model';
import { FamisGridActionEvent } from '../../../_models/shared/famis-grid-action-event.model';
import { WindowOption } from '../../../_models/window-option';
import { DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { BuildingSortTermDto } from '../../../_api/_runtime/dtos/building-sort-term.dto';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';
import { FieldType } from '../../../_enums/field-type';
import { FamisGridComponent } from '../../../_shared/components/famis-grid.component';

@Component({
  selector: 'quality-control-building-grid',
  templateUrl: './quality-control-building-grid.component.html'
})
export class QualityControlBuildingGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private percentageFieldsArray = [
    'Architect Percent',
    'Depreciation Percent',
    'Overhead Percent',
    'Exclusions Percent',
    'Exterior Wall Openings Percent'
  ];

  private nonNegativeFields = [
    'numberOfStories',
    'manualFireAlarm',
    'autoFireAlarm',
    'sprinkler',
    'passengerElevator',
    'freightElevator',
    'plumbingFixtures'
  ];

  @Output()
  gridSelections = new EventEmitter<Array<BuildingDto>>();

  public buildingGrid: FamisGrid;
  public selectedBuildings = new Array<BuildingDto>();
  public state: State;
  public sort: SortDescriptor[];

  @ViewChild(FamisGridComponent, {static: false})
  famisGrid: FamisGridComponent;

  @Input()
  isReadOnly = true;

  private destroyed$ = new Subject<any>();

  constructor(
    private qualityControlService: QualityControlService,
    private famisGridService: FamisGridService,
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    private helperService: HelperService,
    private buildingInfoService: BuildingInfoService,
    private alertService: AlertService,
    private buildingService: BuildingsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.famisGridService.clearEditedRecords();

    this.state = {
      skip: 0,
      take: 84
    };

    this.buildingGrid = <FamisGrid>{
      height: 600,
      gridId: this.famisGridService.createGrid(),
      totalRecordCount: 0,
      name: 'Buildings',
      supportedOperators: this.isReadOnly
        ? [FamisGridFeature.MultiSelectable, FamisGridFeature.ColumnSelection, FamisGridFeature.Sort]
        : [
          FamisGridFeature.MultiSelectable,
          FamisGridFeature.ColumnSelection,
          FamisGridFeature.Sort,
          FamisGridFeature.InGridEditable,
          FamisGridFeature.Filter
        ],
      actions: this.isReadOnly ? ['Map', 'View', 'Image'] : ['Map', 'Edit', 'Image'],
      translationBaseKey: this.i18n.building,
      dataSource: DataTargetName.building,
      groupId: this.qualityControlService.groupId,
      defaultSort: [<SortDescriptor>{field: 'displayId', dir: 'asc'}]
    };

    this.famisGridService.setUserId();
    this.buildingGrid.loading =
    this.qualityControlService.getBuildingSearchMetadataByGroupId(this.qualityControlService.groupId).subscribe(buildingMetadata => {
      this.mapMetaDataPercentFields(buildingMetadata.fields);

      buildingMetadata.fields.forEach(field => {
        if (field.name === 'valuationCreatedDate') {
          field.fieldType = 15;
        }
      });

      this.buildingGrid.columnHeaders =
        this.helperService.mapHeaders(buildingMetadata.fields, this.buildingInfoService.GetInternalColumns());

      this.buildingGrid.selectedHeaders = this.buildingInfoService.GetDefaultColumns();
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  updateCache(request: FamisGridCacheResult) {
    const s = this;

    this.buildingGrid.loading = s.processCacheUpdateBuilding(request);
    this.buildingGrid.cacheLoading = this.buildingGrid.loading;
  }

  handleSelectionChanged(event: SelectionChangeEvent) {
    this.selectedBuildings = this.selectedBuildings.concat(event.itemsAdded.map(c => <BuildingDto>c.dataItem));

    event.itemsRemoved.forEach(item => {
      const index = this.selectedBuildings.indexOf(item.dataItem);
      if (index !== -1) {
        this.selectedBuildings.splice(index, 1);
      }
    });

    this.gridSelections.emit(this.selectedBuildings);

  }

  handleCellValueChanged(result: Array<DataItemValue>) {

    const resultToSave = JSON.parse(JSON.stringify(result));

    console.log(event, 'handleCellValueChanged');

    resultToSave.forEach(editItem => {
      delete editItem.dataItem.imageCollection;

      const buildingDto = this.buildingInfoService.convertStringsToEnum(<BuildingDto>editItem.dataItem);

      this.buildingService.updateBuilding(editItem.itemId, buildingDto).subscribe(
        () => {
          this.alertService.success('Building(s) edited successfuly');

          this.famisGridService.removeEditedRecord(editItem.itemId);
          this.famisGridService.removeRecordWithErrors(editItem.itemId);
        },
        error => {
          this.alertService.error(!!error.error ? error.error : 'An error has occurred saving the building');

          this.famisGridService.addRecordsWithErrors(editItem.itemId, editItem.dataItem);
        }
      );
    });
  }

  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Map':
        const viewMapModal = this.windowManager.open(ViewMapComponent, 'Map', <WindowOption>{
          isModal: true
        });

        viewMapModal.content.instance.latitude = parseFloat(event.item.latitude);
        viewMapModal.content.instance.longitude = parseFloat(event.item.longitude);
        viewMapModal.content.instance.buildingName = event.item.buildingName;
        break;

      case 'Edit':
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/EditBuilding/${event.item.id}`]);

        break;

      case 'View':
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/ViewBuilding/${event.item.id}`]);

        break;

      default:
        break;
    }
  }

  handleDataStateChanged(state: DataStateChangeEvent) {
    const s = this;

    this.state = state;

    this.famisGridService
      .update(
        s.buildingGrid.gridId,
        s.state.skip,
        s.state.take,
        s.buildingGrid.totalRecordCount,
        s.famisGridService.currentSort[s.buildingGrid.gridId],
        true)
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        if (result.updateCache) {
          s.updateCache(result);
        } else {
          if (result.gridId === s.buildingGrid.gridId) {
            s.buildingGrid.gridData = of(result.cachedData);
          }
        }
      });
  }

  handleSortChanged(sort: SortDescriptor[]) {
    const s = this;
    this.sort = sort;
    const sortTerms = new Array<BuildingSortTermDto>();
    const orderCount = 0;

    sort.forEach(c => {
      const sortTerm = <BuildingSortTermDto>{
        termOrder: orderCount,
        sortDirection: c.dir === 'asc' ? 0 : 1,
        field: c.field
      };
      sortTerms.push(sortTerm);
    });

    this.famisGridService.currentSort[this.buildingGrid.gridId] = sortTerms;

    s.famisGridService
      .update(
        s.buildingGrid.gridId,
        s.state.skip,
        s.state.take,
        s.buildingGrid.totalRecordCount,
        s.famisGridService.currentSort[s.buildingGrid.gridId],
        true)
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        s.updateCache(result);
      });
  }

  private mapMetaDataPercentFields(metaDataFields: FieldMetaDataDto[]) {
    metaDataFields.map((field) => {
      if (this.percentageFieldsArray.some((percentageField) => percentageField === field.displayName)) {
        field.fieldType = FieldType.Percent.valueOf();
      }
    });
  }

  private processCacheUpdateBuilding(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    this.selectedBuildings = new Array<BuildingDto>();

    if (this.famisGrid) {
      this.famisGrid.selectedRows = [];
    }

    return this.qualityControlService
      .updateBuildingData(
        s.qualityControlService.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
        cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
        cacheUpdateRequest ? cacheUpdateRequest.filters : null
      )
      .subscribe(dto => {
        this.buildingGrid.totalRecordCount = dto.totalInRecordSet;

        s.famisGridService.setCacheRecords(
          s.buildingInfoService.mapGridColumns(dto.buildings),
          s.buildingGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.totalInRecordSet,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultTake
        );

        this.famisGrid.dataLoading = false;
      });
  }
}
