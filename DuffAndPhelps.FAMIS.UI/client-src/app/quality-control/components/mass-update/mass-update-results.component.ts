import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { QualityControlService } from '../../services/quality-control.service';
import { AlertService } from '../../../_core/services/alert.service';
import { ReplaceFieldComponent } from '../../../_shared/components/replace-field.component';

import { MassUpdateService } from '../../services/mass-update.service';
import { HelperService } from '../../../_core/services/helper.service';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { QualityControlModes } from '../../enums/quality-control-modes';
import { BuildingInfoService } from '../../../_core/services/building-info-service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { FieldMetaDataDto } from '../../../_api/_runtime/dtos/field-meta-data.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { MassUpdateRequestDto } from '../../../_api/_runtime/dtos/mass-update-request.dto';
import { BuildingSearchDto } from '../../../_api/_runtime/dtos/building-search.dto';
import { Subscription, Subject } from 'rxjs';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { ReplaceFieldSelectionInfo } from '../../../_models/shared/replace-field-selection-info.model';
import { ReplaceField } from '../../../_models/replace-field-state.model';
import { Router, ActivatedRoute } from '@angular/router';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';
import { FamisGridActionEvent } from '../../../_models/shared/famis-grid-action-event.model';
import { NgForm } from '@angular/forms';
import { SortTerm } from '../../../_api/_runtime/dtos/sort-term.dto';
import { AssetSearchDto } from '../../../_api/_runtime/dtos/asset-search.dto';
import { ApiServiceResult } from "../../../_api/dtos/api-service-result.dto";
import { AttributeTypesAndCodesResult } from "../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto";

@Component({
  selector: 'mass-update-results',
  templateUrl: './mass-update-results.component.html'
})
export class MassUpdateResultsComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  isAdvanced = false;
  resultsGrid: FamisGrid;

  // Observer Context
  mode: number = Number(this.route.snapshot.queryParamMap.get('mode'));
  filterMetaData = new Array<FieldMetaDataDto>();
  defaultFilterTerm = new Array<FilterDto>();
  translatedBaseKey: string;
  recordsFoundCount = 0;
  searchInProgress: AssetSearchDto;
  requestInProgress: MassUpdateRequestDto;
  buildingSearchInProgress: BuildingSearchDto;

  loading: Subscription;
  contextSubscription: Subscription;
  inProgressSubscription: Subscription;
  public sort: SortDescriptor[];
  public state: State;
  private assets = new Array<AssetDto>();
  replaceSelectionInfo = new Array<ReplaceFieldSelectionInfo>();
  private windowSize = 500;
  private initWindowSize = 84;

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();


  @ViewChild(ReplaceFieldComponent, {static: true}) private replaceFieldComponent: ReplaceFieldComponent;

  private replaceFieldState = <ReplaceField>{};

  constructor(
    private router: Router,
    private qualityControlService: QualityControlService,
    private massUpdateService: MassUpdateService,
    private famisGridService: FamisGridService,
    private alertService: AlertService,
    private helperService: HelperService,
    private assetFileInfoService: AssetFileInfoService,
    private route: ActivatedRoute,
    private buildingInfoService: BuildingInfoService
  ) {}

  private siteAttributeFields = this.buildingInfoService.GetSiteAttributeFields();

  ngOnInit() {
    const parentThis = this;
    this.state = {
      skip: 0,
      take: 84
    };
    this.translatedBaseKey = this.mode === 0 ? this.i18n.asset : this.i18n.building;
    this.massUpdateService.massUpdateContext$.pipe(takeUntil(this.destroyed$)).subscribe((context) => {
      parentThis.defaultFilterTerm = context.defaultFilterTerm;
      parentThis.filterMetaData = context.filterMetaData;

      // If user loads reloads page
      if (!parentThis.filterMetaData) {
        this.back();
      } else {
        if (parentThis.mode === QualityControlModes.Content) {
          parentThis.assetData(parentThis.filterMetaData);

        } else {
          parentThis.buildingData(parentThis.filterMetaData);
        }
        const sort = [{field: 'displayId', dir: 'asc'}] as SortDescriptor[];
        this.handleSortChanged(sort);
      }

      this.qualityControlService
      .getAccountData(this.qualityControlService.groupId)
      .subscribe(accounts => {
        this.replaceSelectionInfo.push(this.qualityControlService.mapAccounts(accounts));
        this.replaceFieldComponent.selectionFieldInfo = this.replaceSelectionInfo;
      });

      this.qualityControlService
      .getDepartmentData(this.qualityControlService.groupId)
      .subscribe(departments => {
        this.replaceSelectionInfo.push(this.qualityControlService.mapDepartments(departments));
        this.replaceFieldComponent.selectionFieldInfo = this.replaceSelectionInfo;
      });

      this.qualityControlService
      .getAttributeTypesAndCodes()
      .subscribe( attributeTypesAndCodes => {
        const siteAttributeTypeaAndCodes = this.getSelectedSiteAttributeOptions(attributeTypesAndCodes, this.siteAttributeFields);
        const siteAttributesWithOptions = this.qualityControlService.mapSiteAttributeTypesAndCodes(siteAttributeTypeaAndCodes);
        this.replaceSelectionInfo.push(...siteAttributesWithOptions);
        this.replaceFieldComponent.selectionFieldInfo = this.replaceSelectionInfo;
      });
    });
    
    this.massUpdateService.massUpdateRequest$.pipe(takeUntil(this.destroyed$)).subscribe(request => {
      this.requestInProgress = request;
      this.replaceFieldState.replacementField = request.field;
      this.replaceFieldState.replacementValue = request.textReplaceValue;
      this.isAdvanced = !!request.advancedReplaceOperation;
    });
    
    // Subscribe for when the replacement field and value change

    this.massUpdateService.currentReplaceComponentState.pipe(takeUntil(this.destroyed$)).subscribe(state => {
      if (state.replacementField) {
        this.replaceFieldState = state;
        this.replaceFieldComponent.state = state;
        this.requestInProgress.field = this.replaceFieldState.replacementField;
        this.requestInProgress.textReplaceValue = this.replaceFieldState.replacementValue;
        this.requestInProgress.advancedReplaceOperation = this.replaceFieldState.advancedReplacementValue;
        this.isAdvanced = !!state.advancedReplacementValue;
        this.massUpdateService.updateMassUpdateRequest(this.requestInProgress);
      }
    });

    this.replaceFieldComponent.state = this.replaceFieldState;

    this.replaceFieldComponent.modelChanged.pipe(takeUntil(this.destroyed$)).subscribe(model => {
      this.replaceFieldState = model;
      this.requestInProgress.field = this.replaceFieldState.replacementField;
      this.requestInProgress.textReplaceValue = this.replaceFieldState.replacementValue;
      this.requestInProgress.advancedReplaceOperation = this.replaceFieldState.advancedReplacementValue;
      this.replaceFieldComponent.state.isAdvanced = !!this.replaceFieldState.advancedReplacementValue;
      this.massUpdateService.updateMassUpdateRequest(this.requestInProgress);
    });


  }

  updateCache(request: FamisGridCacheResult) {
    if (request.gridId === this.resultsGrid.gridId) {
      if (this.mode === QualityControlModes.Content) {
        this.resultsGrid.cacheLoading = this.processCacheUpdate(request);
      } else {
        this.resultsGrid.cacheLoading = this.processCacheUpdateBuilding(request);
      }
    }
  }

  handleActionEvent(actionEvent: FamisGridActionEvent) {
    if (actionEvent.action === 'Exclude') {
      // console.log('Exclude event', actionEvent);
    }
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      // Clear the text replace field if we have an advaned field
      if (this.requestInProgress.advancedReplaceOperation) {
        this.requestInProgress.textReplaceValue = null;
        this.replaceFieldComponent.updateAdvancedModel();
      }

      this.massUpdateService.commitMassUpdate(this.mode).pipe(takeUntil(this.destroyed$)).subscribe(result => {
        this.massUpdateService.clearMassUpdateRequest(this.defaultFilterTerm);
        this.massUpdateService.clearTermsForFilterCriteria();
        if (result && result.code === 6) {
          this.alertService.error('Mass Update failed. Attempted to divide by zero');
        } else {
          this.alertService.success('{{field}} has been updated for {{totalRecords}} records.',
            true, {field: result.result.field, totalRecords: result.result.totalRecords});
        }
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`],
          { queryParams: { mode: this.mode }
        });
      });
    }
  }

  back() {
    if (this.mode === QualityControlModes.Content) {
      this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/MassUpdate/Content`],
        { queryParams: { mode: this.mode }
      });
    } else {
      this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/MassUpdate/Building`],
        {queryParams: { mode: this.mode }
      });
    }
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;
    const sortTerms = !!cacheUpdateRequest && !!cacheUpdateRequest.sortTerms ?
      cacheUpdateRequest.sortTerms : this.searchInProgress.sortTerms;
    const filterTerms = !!cacheUpdateRequest && !!cacheUpdateRequest.filters ?
      cacheUpdateRequest.filters : this.searchInProgress.filterTerms;
    const getActivityCodes = this.massUpdateService.getActivityCodes();
    getActivityCodes.subscribe((activityCodes) => {
      this.assetFileInfoService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');
    });

    return this.qualityControlService
      .updateData(this.qualityControlService.groupId, 0, this.initWindowSize, sortTerms, filterTerms)
      .subscribe(
        result => {
          s.assets = result.assets.map(c => c.assetData);

          this.resultsGrid.totalRecordCount = result.totalInRecordSet;
          this.recordsFoundCount = result.totalInRecordSet;
          this.famisGridService.setCacheRecords(
            this.assetFileInfoService.mapEnums(s.assets),
            this.resultsGrid.gridId,
            0,
            result.totalInRecordSet,
            this.initWindowSize
          );
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
      },
        () => {}
      );
  }

  private processCacheUpdateBuilding(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;
    const sortTerms = !!cacheUpdateRequest && !!cacheUpdateRequest.sortTerms ?
      cacheUpdateRequest.sortTerms : this.buildingSearchInProgress.sortTerms;
    const filterTerms = !!cacheUpdateRequest && !!cacheUpdateRequest.filters ?
      cacheUpdateRequest.filters : this.buildingSearchInProgress.filterTerms;
    return this.qualityControlService
      .updateBuildingData(this.qualityControlService.groupId, 0, this.initWindowSize, sortTerms, filterTerms)
      .subscribe(
        result => {
          this.resultsGrid.totalRecordCount = result.totalInRecordSet;
          this.recordsFoundCount = result.totalInRecordSet;
          this.famisGridService.setCacheRecords(
            s.buildingInfoService.mapGridColumns(result.buildings),
            s.resultsGrid.gridId,
            cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
            result.numberInThisPayload,
            this.resultsGrid.windowSize
          );
        },
        error => { },
        () => { }
      );
  }

  private assetData(filterMetaData: Array<FieldMetaDataDto>) {
    this.resultsGrid = <FamisGrid>{
      gridId: this.famisGridService.createGrid(),
      dataSource: this.qualityControlService.dataTarget,
      windowSize: this.windowSize,
      totalRecordCount: 0,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.translatedBaseKey
    };

    this.replaceFieldState.collection = filterMetaData;

    this.resultsGrid.columnHeaders = this.helperService.mapHeaders(filterMetaData, this.assetFileInfoService.GetInternalColumns());
    this.resultsGrid.selectedHeaders = this.assetFileInfoService.GetDefaultMassUpdateColumns();

    this.massUpdateService.massUpdateCriteriaSearch$.pipe(takeUntil(this.destroyed$)).subscribe(searchInProgress => {
      this.searchInProgress = searchInProgress;
      this.resultsGrid.loading = this.processCacheUpdate();
    });
  }

  handleSortChanged(sort: SortDescriptor[]) {
    const s = this;
    this.sort = sort;
    const sortTerms = new Array<SortTerm>();
    const orderCount = 0;

    sort.forEach(c => {
      const sortTerm = <SortTerm>{
        termOrder: orderCount,
        sortDirection: c.dir === 'asc' ? 0 : 1,
        field: c.field
      };
      sortTerms.push(sortTerm);
    });

    this.famisGridService.currentSort[this.resultsGrid.gridId] = sortTerms;

    s.famisGridService
      .update(
        s.resultsGrid.gridId,
        s.state.skip,
        s.state.take,
        s.resultsGrid.totalRecordCount,
        s.famisGridService.currentSort[s.resultsGrid.gridId],
        true)
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        s.updateCache(result);
      });
  }

  private buildingData(filterMetaData: Array<FieldMetaDataDto>) {
    this.resultsGrid = <FamisGrid>{
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.translatedBaseKey
    };

    this.replaceFieldState.collection = filterMetaData;

    this.resultsGrid.columnHeaders = this.helperService.mapHeaders(
      filterMetaData,
      this.buildingInfoService.GetInternalColumns()
    );
    this.resultsGrid.selectedHeaders = this.buildingInfoService.GetDefaultColumns();

    this.massUpdateService.massUpdateCriteriaSearch$.pipe(takeUntil(this.destroyed$)).subscribe(searchInProgress => {
      this.buildingSearchInProgress = searchInProgress;

      this.resultsGrid.loading = this.processCacheUpdateBuilding();
    });
  }

  private getSelectedSiteAttributeOptions (attributeTypesAndCodesResult: ApiServiceResult<Array<AttributeTypesAndCodesResult>>,siteAttributes: string[]): Array<AttributeTypesAndCodesResult> {
    const siteAttribOptions = [];
    siteAttributes.forEach( siteAttribute => {
      const siteAttribOption = attributeTypesAndCodesResult.result.find(c => c.name.toLowerCase() === siteAttribute.toLowerCase() );
      siteAttribOptions.push(siteAttribOption);
    });
    return siteAttribOptions;
  }
}
