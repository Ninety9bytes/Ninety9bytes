import { DepreciationService } from '../services/depreciation.service';

import { forkJoin, Subject, Subscription } from 'rxjs';
import { AlertService } from '../../../_core/services/alert.service';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { depreciationHeaders, defaultDepreciationHeaders, assetFileRecordHeaders, errorColumn } from '../../default-values/default-headers';
import { ProcessingService } from '../../services/processing.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { futureYearsMetaData } from '../../default-values/future-years-headers';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { ProcessingSummary } from '../../../_models/processing/processing-summary.model';
import { Router } from '@angular/router';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';

@Component({
  selector: 'depreciation-summary',
  templateUrl: './depreciation-summary.component.html'
})
export class DepreciationSummaryComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  // TODO: Pull in header info from runtime API metadata route

  private windowSize = 500;
  private initWindowSize = 84;
  private subGridMetaData: Array<GridColumnHeader> = futureYearsMetaData;

  public successGrid: FamisGrid;
  public errorGrid: FamisGrid;

  processingSummary = <ProcessingSummary>{
    successCount: 0,
    errorCount: 0,
    processingVerb: 'Depreciated'
  };


  constructor(
    private router: Router,
    private depreciationService: DepreciationService,
    private alertService: AlertService,
    private famisGridService: FamisGridService,
    private processingService: ProcessingService
  ) {}

  ngOnInit() {
    const s = this;

    this.famisGridService.resetCache();
    this.depreciationService.clearDepreciation();

    this.successGrid = <FamisGrid>{
      gridData: this.depreciationService.successGridData$,
      gridSubGridData: {
        subGridData: [],
        subGridHeaders: this.subGridMetaData
      },
      gridId: this.famisGridService.createGrid(),
      columnHeaders: depreciationHeaders.concat(assetFileRecordHeaders),
      selectedHeaders: defaultDepreciationHeaders,
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'Summary',
      dataSource: this.processingService.dataTarget,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.asset,
      
    };

    this.errorGrid = <FamisGrid>{
      gridData: this.depreciationService.errorGridData$,
      gridId: this.famisGridService.createGrid(),
      columnHeaders: errorColumn.concat(depreciationHeaders).concat(assetFileRecordHeaders),
      selectedHeaders: ['ValidationErrors'].concat(defaultDepreciationHeaders),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'Errors',
      dataSource: this.processingService.dataTarget,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.asset
    };

    const getSuccessfulRecords = s.depreciationService.updateDepreciationResults(
      s.processingService.groupId,
      s.famisGridService.defaultSkip,
      s.famisGridService.defaultTake,
      true
    );
    const getErrorRecords = s.depreciationService.updateDepreciationResults(
      s.processingService.groupId,
      s.famisGridService.defaultSkip,
      s.famisGridService.defaultTake,
      false
    );
    const getActivityCodes = this.depreciationService.getActivityCodes();

    const loading = forkJoin(getSuccessfulRecords, getErrorRecords, getActivityCodes).subscribe(([
      successfulRecords,
      errorRecords,
      activityCodes
    ]) => {
      s.processingService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');

      if (successfulRecords) {
        s.successGrid.totalRecordCount = successfulRecords.totalInRecordSet;
        s.processingSummary.successCount = successfulRecords.totalInRecordSet;
        s.depreciationService.setSuccessGridDataSource(successfulRecords.assets);

        if (successfulRecords.assets.length > 0) {
          s.successGrid.gridSubGridData.subGridData = Array.isArray(successfulRecords.futureYears) ? successfulRecords.futureYears : [];
          s.famisGridService.setCacheRecords(
            this.processingService.mapEnums(successfulRecords.assets),
            s.successGrid.gridId,
            0,
            successfulRecords.totalInRecordSet,
            s.initWindowSize
          );
        }
      }

      if (errorRecords) {
        s.errorGrid.totalRecordCount = errorRecords.totalInRecordSet;
        s.processingSummary.errorCount = errorRecords.totalInRecordSet;

        s.depreciationService.setErrorGridDataSource(this.processingService.mapEnums(errorRecords.assets));

        s.famisGridService.setCacheRecords(errorRecords.assets, this.errorGrid.gridId, 0, errorRecords.totalInRecordSet, s.initWindowSize);
        }
    });

    s.successGrid.loading = loading;
    s.errorGrid.loading = loading;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  updateCache(request: FamisGridCacheResult) {
    const s = this;

    if (request.gridId === s.successGrid.gridId) {
      this.successGrid.cacheLoading = s.processCacheUpdate(request, true);
    }

    if (request.gridId === s.errorGrid.gridId) {
      this.errorGrid.cacheLoading = s.processCacheUpdate(request, false);
    }
  }

  back() {
    this.router.navigate([`/project-profile/${this.processingService.groupId}/Depreciation/Setup`]);
  }

  commit() {
    this.depreciationService.commitDepreciation(this.processingService.groupId).subscribe(result => {
      if (result.success) {
        this.alertService.success(`Depreciation Successful: {{recordsProcessed}} Records Processed`,
         null, {recordsProcessed: result.recordsProcessed});
        this.router.navigate([`/project-profile/${this.processingService.groupId}/Depreciation/Setup`]);
      } else {
        this.alertService.error(`An error has occurred while commiting the Depreciation`);
      }
    });
  }

  private processCacheUpdate(cacheUpdateRequest: FamisGridCacheResult, returnSuccessful: boolean = true): Subscription {
    const s = this;

    if (cacheUpdateRequest.filters) {
      cacheUpdateRequest.filters.forEach(filter => {
        filter.term.dataTarget = s.processingService.dataTarget;
      });
    }

    return this.depreciationService
      .updateDepreciationResults(
        s.processingService.groupId,
        cacheUpdateRequest.cacheWindow.skip,
        cacheUpdateRequest.cacheWindow.take,
        returnSuccessful,
        cacheUpdateRequest.sortTerms,
        cacheUpdateRequest.filters
      )
      .subscribe(dto => {
        if (cacheUpdateRequest.gridId === s.successGrid.gridId) {
          this.successGrid.totalRecordCount = dto.totalInRecordSet;
          this.successGrid.gridSubGridData.subGridData = Array.isArray(dto.futureYears) ? dto.futureYears : [];
          s.famisGridService.setCacheRecords(
            this.processingService.mapEnums(dto.assets),
            cacheUpdateRequest.gridId,
            cacheUpdateRequest.cacheWindow.skip,
            dto.numberInThisPayload,
            this.successGrid.windowSize
          );
        }

        if (cacheUpdateRequest.gridId === s.errorGrid.gridId) {
          this.errorGrid.totalRecordCount = dto.totalInRecordSet;

          s.famisGridService.setCacheRecords(
            this.processingService.mapEnums(dto.assets),
            cacheUpdateRequest.gridId,
            cacheUpdateRequest.cacheWindow.skip,
            dto.numberInThisPayload,
            this.errorGrid.windowSize
          );
        }
      });
  }
}
