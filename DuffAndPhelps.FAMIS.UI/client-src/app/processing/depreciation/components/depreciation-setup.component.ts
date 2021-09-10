import { ProcessingService } from '../../services/processing.service';
import { FilterCriteriaBuilderComponent } from '../../../_shared/components/filter-criteria-builder.component';
import { DepreciationService } from '../services/depreciation.service';

import { DepreciationFormService } from '../services/depreciation-form.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { DepreciationSubmissionRequestDto } from '../../../_api/_runtime/dtos/depreciation-request.dto';
import { Subject, forkJoin } from 'rxjs';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';
import { EnumOptionDto } from '../../../_api/_configuration/dtos/enum-option.dto';
import { Router, ActivatedRoute } from '@angular/router';
import { FamisViewModelDto } from '../../../_api/_runtime/dtos/famis-view-model.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';

@Component({
  selector: 'depreciation-component',
  templateUrl: './depreciation-setup.component.html'
})
export class DepreciationSetupComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  depreciationRequest = <DepreciationSubmissionRequestDto>{};

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  @ViewChild('filterCriteria', { read: ViewContainerRef, static: false })
  filterCriteriaContainer: ViewContainerRef;

  inventoryMetadata = new Array<FieldMetaDataDto>();

  depreciationMethods = new Array<EnumOptionDto>();
  conventions = new Array<EnumOptionDto>();

  subProfile: FamisViewModelDto;
  mainProfile: FamisViewModelDto;
  PropertyRecordsOutsourcingServiceId = '940d7763-a908-4509-aaf9-daa136863979';
  isProcessing = false;

  private hiddenFields = [
    'id',
    'assetFileId',
    'sourceRecordId',
    'groupId',
  ];

  constructor(
    private processingService: ProcessingService,
    private depreciationFormService: DepreciationFormService,
    private depreciationService: DepreciationService,
    private router: Router,
    private route: ActivatedRoute,
    private componentResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    this.depreciationService.depreciationRequest$.
    pipe(takeUntil(this.destroyed$)).subscribe(requestInProgress => {
      this.depreciationRequest = requestInProgress;
    });

    // Init form fields
    const getDepreciationMethods = this.depreciationFormService.getDepreciationMethods();
    const getDepreciationConventions = this.depreciationFormService.getDepreciationConventions();
    const getSubProfileFields = this.depreciationFormService.getSubProfileFields(this.processingService.groupId);
    const getFilterDataSource = this.processingService.GetSearchMetadataByGroupId(
      this.processingService.groupId,
      this.processingService.dataTarget
    );
    const getMainProfileService = this.depreciationFormService.getMainProfileFields(this.processingService.groupId);


      forkJoin(getDepreciationMethods, getDepreciationConventions, getSubProfileFields, getFilterDataSource, getMainProfileService)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(([methods, conventions, subProfile, filterDataSource, mainProfile]) => {
        this.depreciationMethods = methods.result.enumOptions;
        this.conventions = conventions.result.enumOptions;
        this.subProfile = subProfile;
        this.inventoryMetadata = filterDataSource.fields.filter(x => !(this.hiddenFields.indexOf(x.name) > -1));
        this.mainProfile = mainProfile;

        if (this.inventoryMetadata.length > 0) {
          if (this.depreciationRequest.filterTerms.length === 0) {
            this.addFilter();
          }

          // Set existing filters on page load if present
          this.depreciationRequest.filterTerms.forEach(filter => {
            if (filter.operation !== 'noop') {
              this.addFilter(filter);
            }
          });
        }
        const serviceField = this.mainProfile.fields.find(c => c.fieldName === 'Service');
          if (serviceField.value && serviceField.value.value === this.PropertyRecordsOutsourcingServiceId) {
            this.depreciationRequest.futureYears = 1;
          } else {
            this.depreciationRequest.futureYears = 0;
          }
        },
      error => {},
      () => {});
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  addFilter(filter?: FilterDto) {
    const comp = this.componentResolver.resolveComponentFactory(FilterCriteriaBuilderComponent);
    const filterCriteria = this.filterCriteriaContainer.createComponent(comp);

    // Setting reference to close/remove
    filterCriteria.instance.ref = filterCriteria;

    filterCriteria.instance.translationKeyBase = this.i18n.asset;

    filterCriteria.instance.filterMetadata = this.inventoryMetadata;
    filterCriteria.instance.criteriaChangedEvent.subscribe(e => {
      const changeFilter = <FilterDto>e;

      changeFilter.term.dataTarget = this.processingService.dataTarget;
      this.depreciationService.addOrUpdateFilter(changeFilter);
    });

    filterCriteria.instance.filterRemovedEvent.subscribe(e => {
      const removedFilter = <FilterDto>e;

      this.depreciationService.removeFilter(removedFilter.id);
    });

    if (filter) {
      filterCriteria.instance.filter = filter;
    }
  }

  getSubProfileFieldValue(fieldName: string) {
    if (this.subProfile && this.subProfile.fields) {
      const field = this.subProfile.fields.find(c => c.fieldName === fieldName);

      return field ? field.value : '';
    } else {
      return '';
    }
  }

  onSubmit(form: any) {
    if (form.valid) {
      this.depreciationService.setDepreciationRequest(this.depreciationRequest);
      this.isProcessing = true;
      this.depreciationService.executeDepreciation(this.processingService.groupId).subscribe(result => {
        this.isProcessing = false;

        this.router.navigate([`/project-profile/${this.processingService.groupId}/Depreciation/Summary`]);
      });
    }
  }
}
