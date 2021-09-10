import { forkJoin, Subscription, Subject } from 'rxjs';
import { QualityControlService } from '../../services/quality-control.service';
import { DuplicateCheckService } from '../../services/duplicate-check/duplicate-check.service';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { ReplaceFieldComponent } from '../../../_shared/components/replace-field.component';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { HelperService } from '../../../_core/services/helper.service';
import { AlertService } from '../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { State } from '@progress/kendo-data-query';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';
import { ReplaceField } from '../../../_models/replace-field-state.model';
import { MassUpdateRequestDto } from '../../../_api/_runtime/dtos/mass-update-request.dto';
import { Router, ActivatedRoute } from '@angular/router';
import { QualityControlApiService } from '../../../_api/_runtime/services/quality-control-api.service';
import { BreadCrumb } from '../../../_models/breadcrumbs.model';
import { FieldType } from '../../../_enums/field-type';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';
import { SelectionChangeEvent } from '../../../_models/selection-change-event.model';
import { AssetFilterTermDto } from '../../../_api/dtos/inventory/asset-search.dto';
import { AssetSearchTermDto } from '../../../_api/_runtime/dtos/asset-search-term.dto';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'duplicate-check',
  templateUrl: './duplicate-check.component.html'
})
export class DuplicateCheckComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public summaryGrid: FamisGrid;
  public duplicateGrid: FamisGrid;

  public running: Subscription;

  public selectedField = '';
  private windowSize = 500;
  public state: State;

  inventoryMetadata = new Array<FieldMetaDataDto>();
  isProcessing = false;
  isLoading = false;
  duplicateField: string;
  public replaceFieldState = <ReplaceField>{};
  request: MassUpdateRequestDto;

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  @ViewChild(ReplaceFieldComponent, {static: true}) private replaceFieldComponent: ReplaceFieldComponent;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private componentResolver: ComponentFactoryResolver,
    private qualityControlService: QualityControlService,
    private qualityControlApiService: QualityControlApiService,
    private duplicateCheckService: DuplicateCheckService,
    private famisGridService: FamisGridService,
    private assetFileInfoService: AssetFileInfoService,
    private helperService: HelperService,
    private alertService: AlertService
  ) {}

  breadCrumbs = [
    <BreadCrumb>{ name: 'Quality Control', routerLink: '../../QualityControl' },
    <BreadCrumb>{ name: 'Duplicate Check', routerLink: '../DuplicateCheck', isDisabled: true }
  ];

  ngOnInit() {
    const s = this;


    // Initialize base request data
    this.request = <MassUpdateRequestDto>{
      textReplaceValue: null,
      field: '',
      filterConjunction: 'and',
      sortTerms: [{field: 'id', sortDirection: 0, termOrder: 0}],
      filterTerms: []
    };

    this.replaceFieldState.replacementField = this.request.field;
    this.replaceFieldState.replacementValue = this.request.textReplaceValue;


    this.duplicateGrid = <FamisGrid>{
      height: 300,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      columnToSelectBy: 'fieldValue',
      name: 'Duplicates',
      columnHeaders: [
        {
          name: 'fieldValue',
          displayName: 'Duplicate Value',
          fieldType: FieldType.String,
          isSearchable: true,
          isFilterable: true,
          isSortable: true,
          isFacetable: false,
          isKey: false,
          isCustom: false
        },
        {
          name: 'count',
          displayName: '# of Duplicates',
          fieldType: 'count',
          isSearchable: true,
          isFilterable: true,
          isSortable: true,
          isFacetable: false,
          isKey: false,
          isCustom: false
        }
      ],
      selectedHeaders: ['fieldValue', 'count'],
      supportedOperators: [FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.asset,
    };

    this.summaryGrid = <FamisGrid>{
      height: 300,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'Summary',
      supportedOperators: [FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.asset
    };

    this.qualityControlService
      .getSearchMetadataByGroupId(this.qualityControlService.groupId, this.qualityControlService.dataTarget)
      .subscribe(metaData => {
        this.summaryGrid.columnHeaders = s.helperService.mapHeaders(metaData.fields, this.assetFileInfoService.GetInternalColumns());
        this.summaryGrid.selectedHeaders = this.assetFileInfoService.GetDefaultDuplicateCheckColumns();
      });

    const getFilterDataSource = this.qualityControlService.getSearchMetadataByGroupId(
      this.qualityControlService.groupId,
      this.qualityControlService.dataTarget
    );

    forkJoin(getFilterDataSource)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        ([filterDataSource]) => {
          this.inventoryMetadata = this.helperService.sortCollection(filterDataSource.fields, 'displayName', 'ASC');
          this.replaceFieldState.collection = filterDataSource.fields;

        },
        error => {},
        () => {
          // Anything on finish?
        }
      );

    // Subscribe for when the replacement field and value change
    this.replaceFieldComponent.modelChanged.subscribe(model => {
      this.request.textReplaceValue = model.replacementValue;
      this.request.field = model.replacementField;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  runDuplicateCheck() {
    this.duplicateGrid.loading = this.processDuplicateCacheUpdate();
  }

  processDuplicateCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.duplicateCheckService
      .updateDuplicateCheckResults(
        s.qualityControlService.groupId,
        s.selectedField,
        s.qualityControlService.dataTarget,
        !!cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : 0,
        !!cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : 0,
        !!cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
        !!cacheUpdateRequest ? cacheUpdateRequest.filters : null
      )
      .subscribe(dto => {
        this.duplicateGrid.totalRecordCount = dto.totalRecords;

        this.famisGridService.setCacheRecords(
          dto.results,
          this.duplicateGrid.gridId,
          0,
          dto.totalRecords,
          this.duplicateGrid.windowSize
        );
      });
  }

  handleDuplicateSelectionChanged(event: SelectionChangeEvent) {
    const s = this;

    const filter = [
      <AssetFilterTermDto>{
        term: <AssetSearchTermDto>{
          dataTarget: s.qualityControlService.dataTarget,
          field: s.selectedField,
          value: event.itemsAdded[0].dataItem.fieldValue },
        operation: 'eq'
      }
    ];

    this.request.filterTerms = filter;

    this.summaryGrid.loading = this.duplicateCheckService
      .updateDuplicateSummary(s.qualityControlService.groupId, 0, 0, null, filter)
      .subscribe(dto => {
        this.summaryGrid.totalRecordCount = dto.totalInRecordSet;

        this.famisGridService.setCacheRecords(
          dto.assets.map(c => c.assetData),
          this.summaryGrid.gridId,
          0,
          dto.totalInRecordSet,
          this.summaryGrid.windowSize
        );
      });
  }

  onSubmit(form: NgForm) {
    if (form.valid && this.request.field && this.request.textReplaceValue) {
      this.qualityControlApiService.executeMassContentUpdate(this.qualityControlService.groupId, this.request).subscribe(result => {
        if(result.code === 6){
          this.alertService.error('Mass Update failed. Attempted to divide by zero');
        }else{
          this.alertService.success('{{field}} has been updated for {{totalRecords}} records.', true,
         {field: result.result.field, totalRecords: result.result.totalRecords});
        }
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`]);
      });
    }
  }

  cancel() {
    this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`]);
  }
}
