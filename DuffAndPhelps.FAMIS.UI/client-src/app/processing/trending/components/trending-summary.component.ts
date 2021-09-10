import { TrendingService } from '../services/trending.service';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { AlertService } from '../../../_core/services/alert.service';
import { FamisGridService } from '../../../_core/services/famis-grid.service';

import {
  trendingHeaders,
  defaultTrendingHeaders,
  trendingErrorColumn,
  assetFileRecordHeaders
} from '../../default-values/default-headers';

import { ProcessingService } from '../../services/processing.service';
import { HelperService } from '../../../_core/services/helper.service';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { TrendingRequestDto } from '../../../_api/_runtime/dtos/trending-request.dto';
import { ProcessingSummary } from '../../../_models/processing/processing-summary.model';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { Router } from '@angular/router';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';

@Component({
  selector: 'trending-summary',
  templateUrl: './trending-summary.component.html'
})
export class TrendingSummaryComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  public loading: Subscription;

  private windowSize = 250;
  private initWindowSize = 84;

  public successGrid: FamisGrid;
  public errorGrid: FamisGrid;
  public trendingRequest: TrendingRequestDto;

  @Input()
  processingSummary = <ProcessingSummary>{
    selectedHeaders: new Array<GridColumnHeader>(),
    successfulRecords: new Array<AssetDto>(),
    errorRecords: new Array<AssetDto>(),
    successCount: 0,
    errorCount: 0,
    processingVerb: 'Trended'
  };

  constructor(
    private router: Router,
    private alertService: AlertService,
    private famisGridService: FamisGridService,
    private processingService: ProcessingService,
    private trendingService: TrendingService,
  ) {}

  ngOnInit() {
    const s = this;

    this.famisGridService.resetCache();
    this.trendingService.clearTrending();

    this.trendingService.trendingRequest$.subscribe(request => {
      this.trendingRequest = request;
    });

    this.successGrid = <FamisGrid>{
      gridData: this.trendingService.successGridData$,
      columnHeaders: trendingHeaders.concat(assetFileRecordHeaders),
      selectedHeaders: defaultTrendingHeaders,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'Summary',
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.trending
    };

    this.errorGrid = <FamisGrid>{
      gridData: this.trendingService.errorGridData$,
      selectedHeaders: ['processingErrorDescription'].concat(defaultTrendingHeaders),
      gridId: this.famisGridService.createGrid(),
      columnHeaders: trendingErrorColumn.concat(trendingHeaders).concat(assetFileRecordHeaders),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'Errors',
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter, FamisGridFeature.ColumnSelection],
      translationBaseKey: this.i18n.trending
    };

    const getSuccessfulRecords =
      this.trendingService.updateTrendingResults(this.processingService.groupId, 0, s.famisGridService.defaultTake, true);
    const getErrorRecords =
      this.trendingService.updateTrendingResults(this.processingService.groupId, 0, s.famisGridService.defaultTake, false);

    const getActivityCodes = this.trendingService.getActivityCodes();

    const loading = forkJoin(getSuccessfulRecords, getErrorRecords, getActivityCodes)
    .subscribe(([sucessfulRecords, errorRecords, activityCodes]) => {
      s.processingService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');
      if (sucessfulRecords) {
        s.successGrid.totalRecordCount = sucessfulRecords.totalInRecordSet;
        s.processingSummary.successCount = sucessfulRecords.totalInRecordSet;
        s.trendingService.setSuccessGridDataSource(sucessfulRecords.assets);

        if (sucessfulRecords.assets.length > 0) {
          s.famisGridService.setCacheRecords(
            this.processingService.mapTrending(sucessfulRecords.assets),
            s.successGrid.gridId,
            0,
            sucessfulRecords.totalInRecordSet,
            s.initWindowSize
          );
        }
      }

      if (errorRecords) {
        s.errorGrid.totalRecordCount = errorRecords.totalInRecordSet;
        s.processingSummary.errorCount = errorRecords.totalInRecordSet;
        s.trendingService.setErrorGridDataSource(this.processingService.mapTrending(errorRecords.assets));

        if (errorRecords.assets.length > 0) {
          s.famisGridService.setCacheRecords(
            errorRecords.assets,
            this.errorGrid.gridId,
            0,
            errorRecords.totalInRecordSet,
            s.initWindowSize);
        }
      }
    });

    s.successGrid.loading = loading;
    s.errorGrid.loading = loading;
  }

  ngOnDestroy() {
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
    this.router.navigate([`/project-profile/${this.processingService.groupId}/Trending/Setup`]);
  }

  commit() {
    this.trendingService.commitTrending(this.processingService.groupId).subscribe(result => {
      if (result.success) {
        this.alertService.success(`Trending Successful: {{recordsProcessed}} Records Processed`,
         null, {recordsProcessed: result.recordsProcessed});

        this.router.navigate([`/project-profile/${this.processingService.groupId}/Trending/Setup`]);
      } else {
        this.alertService.error(`An error has occurred while commiting the Trending`);
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

    return this.trendingService
      .updateTrendingResults(
        s.processingService.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
        returnSuccessful,
        cacheUpdateRequest.sortTerms,
        cacheUpdateRequest.filters
      )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(dto => {
        if (cacheUpdateRequest.gridId === s.successGrid.gridId) {
          this.successGrid.totalRecordCount = dto.totalInRecordSet;

          s.famisGridService.setCacheRecords(
            this.processingService.mapTrending(dto.assets),
            cacheUpdateRequest.gridId,
            cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
            dto.numberInThisPayload,
            this.successGrid.windowSize
          );
        }

        if (cacheUpdateRequest.gridId === s.errorGrid.gridId) {
          this.errorGrid.totalRecordCount = dto.totalInRecordSet;

          s.famisGridService.setCacheRecords(
            this.processingService.mapTrending(dto.assets),
            cacheUpdateRequest.gridId,
            cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
            dto.numberInThisPayload,
            this.errorGrid.windowSize
          );
        }
      });
  }
}
