import { FilterCriteriaBuilderComponent } from '../../../_shared/components/filter-criteria-builder.component';
import { QualityControlService } from '../../services/quality-control.service';
import { MassUpdateService } from '../../services/mass-update.service';
import { ReplaceFieldComponent } from '../../../_shared/components/replace-field.component';
import { QualityControlModes } from '../../enums/quality-control-modes';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input, ViewContainerRef, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { ReplaceField } from '../../../_models/replace-field-state.model';
import { MassUpdateRequestDto } from '../../../_api/_runtime/dtos/mass-update-request.dto';
import { ReplaceFieldSelectionInfo } from '../../../_models/shared/replace-field-selection-info.model';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { FieldMetaDataDto } from '../../../_api/_runtime/dtos/field-meta-data.dto';
import { ApiServiceResult } from "../../../_api/dtos/api-service-result.dto";
import { AttributeTypesAndCodesResult } from "../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto";
import { BuildingInfoService } from '../../../_core/services/building-info-service';

@Component({
  selector: 'mass-update-criteria',
  templateUrl: './mass-update-criteria.component.html'
})

export class MassUpdateCriteriaComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  isAdvanced = false;
  mode: number = Number(this.route.snapshot.queryParamMap.get('mode'));

  @Input() defaultFilterTerm: Array<FilterDto>;
  @Input() filterMetaData: Array<FieldMetaDataDto>;
  @Input() replaceMetaData: Array<FieldMetaDataDto>;
  @Input() translatedBaseKey: string;

  @ViewChild('filterCriteria', { read: ViewContainerRef, static: true })
  filterCriteriaContainer: ViewContainerRef;

  @ViewChild(ReplaceFieldComponent, {static: true})
  private replaceFieldComponent: ReplaceFieldComponent;

  private replaceFieldState = <ReplaceField>{};

  massUpdateRequest = <MassUpdateRequestDto>{};
  inventoryMetadata = new Array<FieldMetaDataDto>();
  isProcessing = false;
  replaceSelectionInfo: Array<ReplaceFieldSelectionInfo>;
  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  constructor(
    private router: Router,
    private componentResolver: ComponentFactoryResolver,
    private qualityControlService: QualityControlService,
    private massUpdateService: MassUpdateService,
    private route: ActivatedRoute,
    private buildingInfoService: BuildingInfoService
  ) { }

  private siteAttributeFields = this.buildingInfoService.GetSiteAttributeFields();

  ngOnInit() {

    this.replaceSelectionInfo = new Array<ReplaceFieldSelectionInfo>();
    this.massUpdateService.massUpdateRequest$.pipe(takeUntil(this.destroyed$))
    .subscribe(request => {
      this.massUpdateRequest = request;
      this.replaceFieldState.replacementField = request.field;
      this.replaceFieldState.replacementValue = request.textReplaceValue;
      if (this.replaceFieldComponent.replaceValue) {
        this.replaceFieldComponent.replaceValue.nativeElement.innerHTML = this.replaceFieldState.advancedReplacementHtml;
      }
    });

    this.setExistingFilters();
    this.replaceFieldState.collection = this.replaceMetaData;
    this.massUpdateService.updateContextSource(this.defaultFilterTerm, this.filterMetaData);
    this.massUpdateService.defaultFilterTerms = this.defaultFilterTerm;

    this.replaceFieldState.isAdvanced = true;

    this.replaceFieldComponent.state = this.replaceFieldState;
    this.replaceFieldComponent.modelChanged.pipe(takeUntil(this.destroyed$))
    .subscribe(model => {
      this.replaceFieldState = model;

      this.massUpdateRequest.field = this.replaceFieldState.replacementField;
      this.massUpdateRequest.textReplaceValue = this.replaceFieldState.replacementValue;
      this.massUpdateRequest.advancedReplaceOperation = this.replaceFieldState.advancedReplacementValue;
    });

    this.qualityControlService
      .getAccountData(this.qualityControlService.groupId)
      .subscribe(accounts => {
        this.replaceSelectionInfo.push(this.qualityControlService.mapAccounts(accounts));
        this.replaceFieldComponent.selectionFieldInfo = this.replaceSelectionInfo;
      }
        );

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
    
    this.massUpdateService.currentReplaceComponentState.pipe(takeUntil(this.destroyed$)).subscribe(state => {
      if (state.replacementField) {
        this.replaceFieldState = state;
        this.replaceFieldComponent.state = state;
        this.massUpdateRequest.field = this.replaceFieldState.replacementField;
        this.massUpdateRequest.textReplaceValue = this.replaceFieldState.replacementValue;
        this.massUpdateRequest.advancedReplaceOperation = this.replaceFieldState.advancedReplacementValue;
        this.isAdvanced = !!state.advancedReplacementValue;
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.replaceFieldState.isAdvanced) {
        this.replaceFieldComponent.updateAdvancedModel();
      }
      if (this.massUpdateRequest.field &&
        (this.massUpdateRequest.textReplaceValue ||
          this.massUpdateRequest.textReplaceValue == null || !this.massUpdateRequest.textReplaceValue)) {
        this.massUpdateService.updateReplaceComponentState(this.replaceFieldComponent.state);
        this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/MassUpdate/Results`],
          { queryParams: { mode: this.mode }
        });
      }
    }
  }

  cancel() {
    this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`],
      { queryParams: { mode: this.mode }
    });
  }

  addFilter(filter?: FilterDto) {
    const comp = this.componentResolver.resolveComponentFactory(FilterCriteriaBuilderComponent);
    const filterCriteria = this.filterCriteriaContainer.createComponent(comp);

    filterCriteria.instance.translationKeyBase = this.translatedBaseKey;
    // Setting reference to close/remove
    filterCriteria.instance.ref = filterCriteria;
    filterCriteria.instance.filterMetadata = this.filterMetaData;

    if (this.mode === QualityControlModes.Content) {
      filterCriteria.instance.dataTarget = this.qualityControlService.dataTarget;
    }

    filterCriteria.instance.criteriaChangedEvent.pipe(takeUntil(this.destroyed$))
    .subscribe(filterChanged => {
      this.massUpdateService.addOrUpdateFilter(filterChanged);
    });

    filterCriteria.instance.filterRemovedEvent.pipe(takeUntil(this.destroyed$))
    .subscribe(filterRemove => {
      this.massUpdateService.removeFilter(filterRemove.id);
    });

    if (filter) {
      filterCriteria.instance.filter = filter;
    }
  }

  private setExistingFilters() {
    if (!this.massUpdateRequest.filterTerms.length) {
      this.addFilter();
    } else {
      this.massUpdateRequest.filterTerms.forEach(filter => {
        this.addFilter(filter);
      });
    }
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
