import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { ProcessingService } from '../../services/processing.service';
import { TrendingService } from '../services/trending.service';
import { FilterCriteriaBuilderComponent } from '../../../_shared/components/filter-criteria-builder.component';
import { forkJoin, of, Subject, Observable } from 'rxjs';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil, catchError, tap, switchMap, distinctUntilChanged, debounceTime, merge } from 'rxjs/operators';
import { TrendingRequestDto } from '../../../_api/_runtime/dtos/trending-request.dto';
import { FieldMetaDataDto } from '../../../_api/_configuration/dtos/field-metadata.dto';
import { EnumOptionDto } from '../../../_api/_configuration/dtos/enum-option.dto';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';
import { ProcessingApiService } from '../../../_api/_runtime/services/processing-api.service';
import { DataProcessingApiService } from '../../../_api/_configuration/services/data-processing-api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FieldType } from '../../../_enums/field-type';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';

@Component({
  selector: 'trending-setup',
  templateUrl: './trending-setup.component.html'
})
export class TrendingSetupComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  trendingRequest = <TrendingRequestDto>{};

  @ViewChild('filterCriteria', { read: ViewContainerRef, static: false })
  filterCriteriaContainer: ViewContainerRef;

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  inventoryMetadata = new Array<FieldMetaDataDto>();
  startingValueOptions: FieldMetaDataDto[];
  endingValueOptions: FieldMetaDataDto[];
  roundingTypeOptions = new Array<EnumOptionDto>();

  model: any; // This is intentional now that typeahead is shared
  searching = false;
  searchFailed = false;
  item: NgbTypeaheadSelectItemEvent = null;
  hideSearchingWhenUnsubscribed = new Observable(() => () => (this.searching = false));

  isProcessing = false;

  private hiddenFields = [
    'id',
    'assetFileId',
    'sourceRecordId',
    'groupId',
  ];

  constructor(
    private referenceDataService: ReferenceDataApiService,
    private processingApiService: ProcessingApiService,
    private processingService: ProcessingService,
    private dataProcessingService: DataProcessingApiService,
    private componentResolver: ComponentFactoryResolver,
    private trendingService: TrendingService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.trendingService.trendingRequest$.subscribe(request => {
      this.trendingRequest = request;
    });

    const getRoundingTypeDataSource = this.referenceDataService.GetRoundingTypes();
    const getFilterDataSource = this.processingService.GetSearchMetadataByGroupId(
      this.processingService.groupId,
      this.processingService.dataTarget
    );

    forkJoin(getRoundingTypeDataSource, getFilterDataSource)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        ([roundingTypeDataSource, filterDataSource]) => {
          this.roundingTypeOptions = roundingTypeDataSource.result.enumOptions;
          this.inventoryMetadata = filterDataSource.fields.filter(x => !(this.hiddenFields.indexOf(x.name) > -1));

          this.startingValueOptions = filterDataSource.fields.filter(
            e => e.fieldType === FieldType.Double || e.fieldType === FieldType.Integer);

          this.endingValueOptions = filterDataSource.fields.filter(
            e => e.fieldType === FieldType.Double || e.fieldType === FieldType.Integer
          );
        },
        error => {},
        () => {
          if (this.trendingRequest.filterTerms.length === 0) {
            this.addFilter();
          }

          // Set existing filters on page load if present
          this.trendingRequest.filterTerms.forEach(filter => {
            if (filter.operation !== 'noop') {
              this.addFilter(filter);
            }
          });

          // Set existing trend table on page load if present
          if (this.trendingRequest.trendingTableId) {
            this.dataProcessingService.getTrendingById(this.trendingRequest.trendingTableId).subscribe(result => {
              this.model = result;
            });
          }
        }
      );
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSubmit(form: any) {
    if (form.valid && !!this.trendingRequest.trendingTableId) {
      this.trendingService.setTrendingRequest(this.trendingRequest);
      this.isProcessing = true;
      this.trendingService.executeTrending(this.processingService.groupId).subscribe(result => {
        if (result) {
          this.isProcessing = false;
          if (result.success) {
            this.router.navigate([`/project-profile/${this.processingService.groupId}/Trending/Summary`]);
          }
        }
      });
    }
  }

  addFilter(filter?: FilterDto) {
    const comp = this.componentResolver.resolveComponentFactory(FilterCriteriaBuilderComponent);
    const filterCriteria = this.filterCriteriaContainer.createComponent(comp);

    // Setting reference to close/remove
    filterCriteria.instance.ref = filterCriteria;
    filterCriteria.instance.filterMetadata = this.inventoryMetadata;
    filterCriteria.instance.translationKeyBase = this.i18n.asset;

    filterCriteria.instance.criteriaChangedEvent.subscribe(e => {
      const addedFilter = <FilterDto>e;

      addedFilter.term.dataTarget = this.processingService.dataTarget;

      this.trendingService.addOrUpdateFilter(addedFilter);
    });

    filterCriteria.instance.filterRemovedEvent.subscribe(e => {
      const removedFilter = <FilterDto>e;

      this.trendingService.removeFilter(removedFilter.id);
    });

    if (filter) {
      filterCriteria.instance.filter = filter;
    }
  }

  /*** Typeahead  ***/
  onSelectItem(selected: NgbTypeaheadSelectItemEvent): void {
    this.trendingRequest.trendingTableId = selected.item.id;
  }

  public getResultFormatter(result) {
    return result.name;
  }

  public getInputFormatter(result) {
    return result.name;
  }

  search = (text$: Observable<string>) =>
    text$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(tap(() => (this.searching = true)))
      .pipe(switchMap(term =>
        this.dataProcessingService
          .searchTrending(term)
          .pipe(tap(() => {
            this.searchFailed = false;
          }))
          .pipe(catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ))
      .pipe(tap(() => {
        this.searching = false;
      }))
      .pipe(merge(this.hideSearchingWhenUnsubscribed))
}
