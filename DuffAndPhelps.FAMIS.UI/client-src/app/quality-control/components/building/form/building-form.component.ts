import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { BuildingAttributes, OccupancyCodeBuildingAttributeTypeId } from './form-models/building-attributes-model';
import { BuildingsService } from '../../../services/buildings.service';
import { QualityControlService } from '../../../services/quality-control.service';
import { AlertService } from '../../../../_core/services/alert.service';
import { BuildingInfoService } from '../../../../_core/services/building-info-service';
import { HelperService } from '../../../../_core/services/helper.service';
import {
  PrimaryInfoFields, BuildingLocationFields, FormModelEnum, BuildingValuationFields, BuildingSubStructureFields,
  BuildingSuperstructureFields, BuildingSystemFields, BuildingSiteAttributeFields, AdditionalDataFields,
  CoreLogicFields, buildingImages, PrimaryInfoFieldLayout, BuildingLocationFieldLayout, BuildingValuationFieldLayout,
  BuildingSuperstructureFieldLayout, BuildingSubStructureFieldLayout, BuildingSystemFieldLayout,
  BuildingSiteAttributeFieldLayout, AdditionalDataFieldLayout, CoreLogicFieldLayout
} from './form-models/primary-info/primaryinfo-model';
import {
  BuildingFloodPlainModel, InitialFloodPlainFields, BuildingFloodPlainFieldLayout,
  InitialFloodPlainFieldLayout } from './form-models/building-flood-plain-model';
import { PrimaryInfoDropDownModel } from './form-models/primary-info/primaryinfo-dropdown-model';
import { BuildingAttributeFields } from './form-models/primary-info/building-attributes-model';
import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import * as MenuSpy from 'menuspy';
import {
  CopedataWindFields,
  CopeDataEarthquakeFields,
  CopeDataEarthquakeFieldLayout,
  CopedataWindFieldLayout } from './form-models/copedata-model';
import { formLayout as FormLayout } from '../../../../_models/form-layout.model';
import { of, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CascadedSelectOption } from '../../../../_models/cascaded-select-option.model';
import { BuildingDto } from '../../../../_api/_runtime/dtos/building.dto';
import { ImageEntityType } from '../../../../_api/_runtime/enums/image-entity-type';
import { AttributeTypeOption,
  AttributeTypesAndCodesResult } from '../../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { Router, ActivatedRoute } from '@angular/router';
import { ImageApiService } from '../../../../_api/_runtime/services/image-api.service';
import { IntlService, parseNumber } from '@progress/kendo-angular-intl';
import { BreadCrumb } from '../../../../_models/breadcrumbs.model';
import { AssetFileSummaryDto } from '../../../../_api/dtos/asset-file-summary.dto';
import { FormField } from '../../../../_models/form-field.model';
import { ContentCode } from '../../../../_api/_configuration/dtos/content-code.dto';
import { BuildingHierarchyDto } from '../../../../_api/_runtime/dtos/building-hierarchy.dto';
import { FieldOption } from '../../../../_models/field-option.model';
import { FieldType } from '../../../../_enums/field-type';
import { Building } from '../../../../_models/building.model';
import { BuildingValuationComponent } from '../actions/building-valuation.component';
import { PerimeterAdjustmentMethod } from '../../../../_api/_runtime/enums/perimeter-adjustment-method';
import { FieldCategory } from '../../../../_enums/field-category';
import { FieldMetaDataDto } from '../../../../_api/dtos/inventory/field-meta-data.dto';

@Component({
  selector: 'building-form',
  templateUrl: './building-form.component.html'
})
export class UpsertBuildingComponent implements OnInit, OnChanges {
  @Input()
  savingForm: boolean;
  public formModelEnum = FormModelEnum;
  public isSaving = false;

  isReadOnly = false;

  i18n = TranslationBaseKeys;

  formModels = [];
  buildingAttributes = BuildingAttributes;
  formGroup: FormGroup;
  cascadedSelectOptions = new Array<Array<CascadedSelectOption>>();
  buildingFormGroup: FormGroup;

  closeForm: boolean;
  buildingId: string;

  formLayouts: Array<FormLayout> = [];

  buildingDto = <BuildingDto>{
    id: '',
    buildingSelectedAdditions: [],
    buildingSelectedAdjustments: [],
    occupancyCodes: [],
    buildingAttributes: [],
    userFactors: [],
    customAdditions: []
  };

  imageEntityTypes = ImageEntityType;

  breadCrumbs = [];

  isEditing = false;

  occupancyCodeOptions: AttributeTypeOption[];

  private customFields = new Array<string>();

  @ViewChild('formNavigation', {static: true}) formNavigation: ElementRef;

  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  private isEditBuilding = false;

  @ViewChild(BuildingValuationComponent, {static: true})
  buildingValuationComponent: BuildingValuationComponent;

  private selectedBuildings = new Array<Building>();

  showValuationErrorsButton = false;

  private editedCustomFields: Array<FieldMetaDataDto> = [];

  constructor(
    private buildingService: BuildingsService,
    private qualityControlService: QualityControlService,
    private alertService: AlertService,
    private buildingInfoService: BuildingInfoService,
    private router: Router,
    private intl: IntlService,
    private helperService: HelperService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.paramMap.get('buildingId');

    this.isEditBuilding = this.buildingId ? true : false;

    this.isEditing = !!this.buildingId;

    this.buildingDto = <BuildingDto>{};

    this.formLayouts[FormModelEnum.PrimaryInfoFields] = PrimaryInfoFieldLayout;
    this.formLayouts[FormModelEnum.BuildingLocationFields] = BuildingLocationFieldLayout;
    this.formLayouts[FormModelEnum.BuildingValuationFields] = BuildingValuationFieldLayout;
    this.formLayouts[FormModelEnum.BuildingSuperstructureFields] = BuildingSuperstructureFieldLayout;
    this.formLayouts[FormModelEnum.BuildingSubstructureFields] = BuildingSubStructureFieldLayout;
    this.formLayouts[FormModelEnum.BuildingSystemsFields] = BuildingSystemFieldLayout;
    this.formLayouts[FormModelEnum.BuildingSiteAttributeFields] = BuildingSiteAttributeFieldLayout;
    this.formLayouts[FormModelEnum.AdditionalDataFields] = AdditionalDataFieldLayout;
    this.formLayouts[FormModelEnum.CoreLogicFields] = CoreLogicFieldLayout;
    this.formLayouts[FormModelEnum.CopeDataEarthquakeFields] = CopeDataEarthquakeFieldLayout;
    this.formLayouts[FormModelEnum.CopedataWindFields] = CopedataWindFieldLayout;
    this.formLayouts[FormModelEnum.InitialFloodPlainFields] = InitialFloodPlainFieldLayout;
    this.formLayouts[FormModelEnum.BuildingFloodPlainModelFields] = BuildingFloodPlainFieldLayout;

    this.formModels[FormModelEnum.PrimaryInfoFields] = JSON.parse(JSON.stringify(PrimaryInfoFields));
    this.formModels[FormModelEnum.BuildingFloodPlainModelFields] = JSON.parse(JSON.stringify(BuildingFloodPlainModel));
    this.formModels[FormModelEnum.InitialFloodPlainFields] = JSON.parse(JSON.stringify(InitialFloodPlainFields));
    this.formModels[FormModelEnum.BuildingLocationFields] = JSON.parse(JSON.stringify(BuildingLocationFields));
    this.formModels[FormModelEnum.BuildingValuationFields] = JSON.parse(JSON.stringify(BuildingValuationFields));
    this.formModels[FormModelEnum.BuildingSubstructureFields] = JSON.parse(JSON.stringify(BuildingSubStructureFields));
    this.formModels[FormModelEnum.BuildingSuperstructureFields] = JSON.parse(JSON.stringify(BuildingSuperstructureFields));
    this.formModels[FormModelEnum.BuildingSystemsFields] = JSON.parse(JSON.stringify(BuildingSystemFields));
    this.formModels[FormModelEnum.BuildingSiteAttributeFields] = JSON.parse(JSON.stringify(BuildingSiteAttributeFields));
    this.formModels[FormModelEnum.AdditionalDataFields] = JSON.parse(JSON.stringify(AdditionalDataFields));
    this.formModels[FormModelEnum.CoreLogicFields] = JSON.parse(JSON.stringify(CoreLogicFields));
    this.formModels[FormModelEnum.BuildingAttributeFields] = JSON.parse(JSON.stringify(BuildingAttributeFields));
    this.formModels[FormModelEnum.CopedataWindFields] = JSON.parse(JSON.stringify(CopedataWindFields));
    this.formModels[FormModelEnum.CopeDataEarthquakeFields] = JSON.parse(JSON.stringify(CopeDataEarthquakeFields));
    this.formModels[FormModelEnum.BuildingImages] = JSON.parse(JSON.stringify(buildingImages));
    this.breadCrumbs = [
      <BreadCrumb>{
        name: 'Quality Control Overview',
        routerLink: `/project-profile/${this.qualityControlService.groupId}/QualityControl`
      },
      <BreadCrumb>{
        name: this.buildingId ? 'Edit Building' : 'Add Building',
        routerLink: 'AddBuilding',
        isDisabled: true
      }
    ];

    const getBuilding = this.buildingId
      ? this.buildingService.getBuilding(this.buildingId)
      : of(<BuildingDto>{
          id: '',
          buildingSelectedAdditions: [],
          occupancyCodes: [],
          buildingAttributes: [],
          userFactors: [],
          customAdditions: []
        });
    const getAttributeTypesAndCodes = this.buildingInfoService.getAttributeTypesAndCodes();
    const getBuildingHierarchyByGroupId = this.buildingInfoService.getBuildingHierarchyByGroupId(this.qualityControlService.groupId);
    const getContentCodes = this.buildingInfoService.getContentCodes();
    const getBuildingConditions = this.buildingInfoService.getBuildingConditions();
    const getBuildingPerimeterAdjustmentMethod = this.buildingInfoService.getBuildingPerimeterAdjustmentMethod();
    const getUnitsOfMeasure = this.buildingInfoService.getUnitsOfMEasure();
    const getEntryAlarmOptions = this.buildingInfoService.getEntryAlarmOptions();
    const getBuildingCustomColumns = this.qualityControlService.getBuildingSearchMetadataByGroupId(this.qualityControlService.groupId);

    forkJoin(
      getBuilding,
      getAttributeTypesAndCodes,
      getBuildingHierarchyByGroupId,
      getContentCodes,
      getBuildingConditions,
      getUnitsOfMeasure,
      getEntryAlarmOptions,
      getBuildingCustomColumns,
      getBuildingPerimeterAdjustmentMethod
    )
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        ([
          building,
          attributeTypesAndCodes,
          buildingHierarchyByGroupId,
          contentCodes,
          buildingConditions,
          unitsOfMeasure,
          entryAlarmOptions,
          buildingCustomColumns,
          buildingPerimeterAdjustmentMethods
        ]) => {
          if (attributeTypesAndCodes) {
            this.buildingDto = building;
            this.selectedBuildings = new Array<any>(this.buildingDto);
            this.buildingService.setBuildingRequestSource(building);
            this.mapCustomColumns(buildingCustomColumns);
            this.mapAttributeTypesAndCodes(attributeTypesAndCodes);

            this.mapSiteId(this.buildingDto, buildingHierarchyByGroupId);

            this.mapContentCodes(contentCodes);

            this.formGroup = this.helperService.toFormGroup(this.mapValues(this.combineForms()));

            const contentCodeControl = this.formGroup.get('contentCode');
            const contentQualityControl = this.formGroup.get('contentQuality');
            const floorAreaControl = this.formGroup.get('floorArea');
            const basementUnfinishedAreaControl = this.formGroup.get('basementUnfinishedArea');
            const basementFinishedAreaControl = this.formGroup.get('basementFinishedArea');
            const basementFloorAreaControl = this.formGroup.get('basementFloorArea');
            const depreciationPercent = this.formGroup.get('depreciationPercent');
            const costReproductionNew = this.formGroup.get('costReproductionNew');

            if (depreciationPercent) {
              depreciationPercent.valueChanges.subscribe(() => {
                this.calculateCostReproductionNewLessDepreciation();
              });
            }

            if (costReproductionNew) {
              costReproductionNew.valueChanges.subscribe(() => {
                this.calculateCostReproductionNewLessDepreciation();
              });
            }

            if (basementUnfinishedAreaControl) {
              basementUnfinishedAreaControl.valueChanges.subscribe(() => {
                this.basementFloorAreaFactorsChanged();
              });
            }

            if (basementFinishedAreaControl) {
              basementFinishedAreaControl.valueChanges.subscribe(() => {
                this.basementFloorAreaFactorsChanged();
              });
            }

            if (basementFloorAreaControl) {
              basementFloorAreaControl.setValue(this.basementFloorAreaFactorsChanged());
            }

            if (contentCodeControl) {
              contentCodeControl.valueChanges.subscribe((contentCode: string) => {
                this.contentCodeChanged(contentCode);
              });
            }

            if (contentQualityControl) {
              contentQualityControl.valueChanges.subscribe(() => {
                if (contentCodeControl && !!contentCodeControl.value) {
                  this.contentCodeChanged(contentCodeControl.value);
                }
              });
            }

            if (floorAreaControl) {
              floorAreaControl.valueChanges.subscribe(() => {
                if (contentCodeControl && !!contentCodeControl.value) {
                  this.contentCodeChanged(contentCodeControl.value);
                }
              });
            }

            setTimeout(() => {
              if (this.formNavigation) {
                const ms = new MenuSpy(this.formNavigation.nativeElement, { activeClass: 'current-item'
                , enableLocationHash: false});
              }
            }, 2000);
          }
          if (buildingPerimeterAdjustmentMethods) {
            const perimeterAdjustmentMethodControl = this.formGroup.get('buildingPerimeterAdjustmentMethod');
            if(perimeterAdjustmentMethodControl){
              if (perimeterAdjustmentMethodControl.value === '') {
              perimeterAdjustmentMethodControl.setValue(PerimeterAdjustmentMethod.Calculated);
              }
              perimeterAdjustmentMethodControl.valueChanges.subscribe(() => {
                this.PerimeterAdjustmentMethodChanged();
            });
          }
          }
        }
      );

    this.buildingService.buildingRequest$.subscribe(buildingDto => {
      this.buildingDto = buildingDto;
      if (!this.buildingDto.id) {
        // set new building default fields
        this.buildingDto.activityCode = '0';
        this.buildingDto.overheadPercent = '20';
        this.buildingDto.architectPercent = '7';
      }
    });
  }

  mapCustomColumns(buildingCustomColumns: AssetFileSummaryDto) {
    const customFields = buildingCustomColumns.fields.filter(bf => bf.isCustom);
    let left = true;
    customFields.forEach(bf => {
      this.customFields.push(bf.name);
      const customField = <FormField> {
        name: bf.name,
        displayName: bf.displayName.replace(/_|-|\./g, ' '),
        type: bf.fieldType,
        id: bf.name,
        required: false,
        fieldCategory: FieldCategory.CustomFields
      };
      this.formModels[FormModelEnum.AdditionalDataFields].push(customField);
      if (left) {
        this.formLayouts[FormModelEnum.AdditionalDataFields].left.push(customField.name);
      } else {
        this.formLayouts[FormModelEnum.AdditionalDataFields].right.push(customField.name);
      }
      left = !left;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.savingForm = changes.savingForm.currentValue;
  }

  save(buildingForm: FormGroup) {
    this.closeForm = false;
    this.onSubmit(buildingForm);
    this.isSaving = false;
  }

  onSubmit(buildingForm: FormGroup) {
    this.isSaving = true;
    const formToSubmit = buildingForm.value;

    // Setting siteId to the last most item in the cascading select list
    buildingForm = this.setSiteId(buildingForm);

    if (!this.checkIsValidLatLon(buildingForm)) {
      return;
    }

    const saveDto = this.mapToBuildingDto(buildingForm.value);

    saveDto.customColumns = this.editedCustomFields;

    // Remove Id of new building attributes (Bug 19969)
    saveDto.buildingAttributes.forEach(attribute => {
      if (attribute.isAdded) {
        delete attribute.id;
      }
    });

    if (buildingForm.valid) {
      if (this.isEditing) {
        this.saveEdit(saveDto);
      } else {
        this.saveNewBuilding(saveDto);
      }
    } else {
      this.alertService.error('Missing required fields');
      this.isSaving = false;
    }
  }

  cancel() {
    this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`], { queryParams: { mode: 1 } });
  }

  preventDefault(event: any) {
    event.preventDefault();
  }

  private saveEdit(buildingDto: BuildingDto): void {
    this.buildingService.updateBuilding(buildingDto.id, buildingDto).subscribe(
      buildingResult => {
        if (this.closeForm) {
          this.formGroup = null;
          this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`], { queryParams: { mode: 1 } });
        }
        this.alertService.success('Building edit successful');
      },
      error => {
        if (error.status !== 458) {
          this.alertService.error(!!error.error ? error.error : 'An error has occurred saving the building');
        }
      }
    );
  }

  private saveNewBuilding(buildingDto: BuildingDto): void {
    this.buildingService.createBuilding(buildingDto, this.qualityControlService.groupId).subscribe(
      result => {
        this.buildingId = result.id;
        if (this.closeForm) {
          this.formGroup = null;
          this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl`], { queryParams: { mode: 1 } });
        } else {
          this.router.navigate([`/project-profile/${this.qualityControlService.groupId}/QualityControl/EditBuilding/${this.buildingId}`], {
            queryParams: { mode: 1 }
          });
        }
        this.alertService.success('Building Added Successfully');
      },
      error => {
        if (error.status !== 458) {
          this.alertService.error(!!error.error ? error.error : 'An error has occurred saving the building');
        }
      }
    );
  }

  private contentCodeChanged(contentCode: string): void {
    const floorAreaValue = this.formGroup.get('floorArea').value;
    const contentQuality = this.formGroup.get('contentQuality').value;
    if (!floorAreaValue) {
      this.formGroup.get('contentCostReproductionNew').setValue(0);
      this.alertService.warn('The Content CRN could not be calculated as the Floor Area has not been provided.');
    } else if (contentCode === '-') {
      // Do nothing
    } else if (!contentQuality) {
      this.formGroup.get('contentCostReproductionNew').setValue(0);
      this.alertService.warn(
        'The Content CRN could not be calculated as the Content Quality has not been provided or value should be greater than zero.'
      );
    } else {
      this.qualityControlService.calculateContentCostReproductionNew(contentCode, contentQuality, floorAreaValue).subscribe(result => {
        const contentCostReproductionNew = this.intl.parseNumber(result);
        this.formGroup.get('contentCostReproductionNew').setValue(contentCostReproductionNew);
      });
    }
  }

  private PerimeterAdjustmentMethodChanged(): void {
    const perimeterAdjustmentMethodValue = this.formGroup.get('buildingPerimeterAdjustmentMethod').value;
    const calculatedPerimeterControl = this.formGroup.get('perimeter');
    if (perimeterAdjustmentMethodValue == PerimeterAdjustmentMethod.Calculated) {
      calculatedPerimeterControl.enable();
     } else {
       calculatedPerimeterControl.disable();
     }
  }

  private calculateCostReproductionNewLessDepreciation() {
    const depreciationPercent = this.formGroup.get('depreciationPercent').value;
    const costReproductionNew = this.formGroup.get('costReproductionNew').value;
    const valuationActualCashValue = this.buildingDto.valuationActualCashValue;
    let costReproductionNewLessDepreciation: any = '';
    if (costReproductionNew && costReproductionNew > 0 && depreciationPercent && depreciationPercent !== 0) {
      costReproductionNewLessDepreciation =  costReproductionNew * (1 - (depreciationPercent / 100));
    } else {
      costReproductionNewLessDepreciation = valuationActualCashValue ? this.intl.parseNumber(valuationActualCashValue) : '';
    }
    this.formGroup.get('costReproductionNewLessDepreciation').setValue(costReproductionNewLessDepreciation);
  }

  private basementFloorAreaFactorsChanged() {
    let basementUnfinishedArea = this.formGroup.get('basementUnfinishedArea').value;
    let basementFinishedArea = this.formGroup.get('basementFinishedArea').value;

    if (basementFinishedArea == null || basementFinishedArea === '') {
      basementFinishedArea = 0;
    }
    if (basementUnfinishedArea == null || basementUnfinishedArea === '') {
      basementUnfinishedArea = 0;
    }

    this.qualityControlService.calculateBasementFloorArea(basementFinishedArea, basementUnfinishedArea).subscribe(result => {
      const basementFloorAreaNew = this.intl.parseNumber(result);
      this.formGroup.get('basementFloorArea').setValue(basementFloorAreaNew);
    });
  }

  private mapToBuildingDto(formValue: any): BuildingDto {
    // Deep copy of the current Building DTO
    const buildingDto = <BuildingDto>JSON.parse(JSON.stringify(this.buildingDto));

    // Mapping form value to building DTO
    Object.keys(formValue).forEach(key => {
      if (key !== 'undefined') {
        buildingDto[key] = formValue[key];
      }
    });

    buildingDto.buildingAttributes
      .filter(c => !!c.isAdded)
      .forEach(attribute => {
        delete attribute.attributeType;
        delete attribute.id;
      });

    buildingDto.occupancyCodes.forEach(occupancyCode => {
      delete occupancyCode.description;
    });

    return buildingDto;
  }

  private setSiteId(form: FormGroup): FormGroup {
    if (form.value.siteId && form.value.siteId.indexOf(',') > 0) {
      form.value.siteId = form.value.siteId.split(',')[1];
    }

    return form;
  }

  private checkIsValidLatLon(form: FormGroup): boolean {
    let validLatLon = true;

    const formValue = form.value;

    if (formValue.latitude !== '' && formValue.longitude !== '' && formValue.latitude !== null && formValue.longitude !== null) {
      formValue.latitude = parseFloat(formValue.latitude).toFixed(8);
      formValue.longitude = parseFloat(formValue.longitude).toFixed(8);
      if (!formValue.latitude.match(/^(-?[1-8]?\d(?:\.\d{6,8})|90(?:\.0{6,8})?)$/)) {
        this.alertService.error('Latitude value out of valid range (-90.000000 : 90.000000)');
        validLatLon = false;
      }
      if (!formValue.longitude.match(/^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{6,8})|180(?:\.0{6,8})?)$/)) {
        this.alertService.error('Longitude value out of valid range (-180.000000 : 180.000000)');
        validLatLon = false;
      }
    }

    return validLatLon;
  }

  private combineForms(): any {
    let combinedForms = new Array<any>();

    this.formModels.forEach(model => {
      combinedForms = combinedForms.concat(model);
    });

    return combinedForms;
  }

  private mapContentCodes(contentCodes: ContentCode[]): void {
    const contentCodeControlIndex = this.formModels[this.formModelEnum.BuildingValuationFields].findIndex(c => c.id === 'contentCode');

    if (contentCodeControlIndex) {
      const options = this.buildingInfoService.mapContentCodeToFieldOptions(contentCodes);
      this.formModels[this.formModelEnum.BuildingValuationFields][contentCodeControlIndex].options = options;
    }
  }

  private mapSiteId(buildingDto: BuildingDto, buildingHierarchyByGroupId: BuildingHierarchyDto): any {
    const siteIdControlIndex = this.formModels[this.formModelEnum.PrimaryInfoFields].findIndex(c => c.id === 'siteId');

    if (buildingDto && siteIdControlIndex !== -1) {
      this.formModels[this.formModelEnum.PrimaryInfoFields][
        siteIdControlIndex
      ].cascadedValueOptions = this.buildingInfoService.mapSitesToSelectOptions(buildingHierarchyByGroupId);

      this.buildingDto.siteId = this.buildingInfoService.mapMemberSiteSelection(
        buildingDto.siteId,
        this.formModels[this.formModelEnum.PrimaryInfoFields][siteIdControlIndex].cascadedValueOptions
      );
    }
  }
  private mapAttributeTypesAndCodes(attributeTypesAndCodes: AttributeTypesAndCodesResult[]): void {
    attributeTypesAndCodes.forEach(attributeType => {
      for (let i = 0, len = this.formModels.length - 1; i < len; i++) {
        if (this.formModels[i]) {
          const index = this.formModels[i].findIndex(c => c.attributeTypeId === attributeType.value);

          if (index !== -1) {
            this.formModels[i][index].options = this.mapToFieldOptions(attributeType.options);
          }
        }
      }

      const index = this.formModels[FormModelEnum.BuildingAttributeFields].findIndex(c => c.attributeTypeId === attributeType.value);

      if (index !== -1) {
        this.formModels[FormModelEnum.BuildingAttributeFields][index].options = this.mapToFieldOptions(attributeType.options);
      }

      if (attributeType.value === OccupancyCodeBuildingAttributeTypeId) {
        this.occupancyCodeOptions = attributeType.options;
      }

      const attributeIndex = this.buildingAttributes.findIndex(c => c.attributeType === attributeType.value);

      if (attributeIndex !== -1) {
        this.buildingAttributes[attributeIndex].attributeValueOptions = attributeType.options;
      }
    });
  }

  private mapToFieldOptions(options: AttributeTypeOption[]): FieldOption[] {
    const fieldOptions = new Array<FieldOption>();
    fieldOptions.push(<FieldOption>{
      displayName: "",
      key:undefined
    });
    options.forEach(option => {
      fieldOptions.push(<FieldOption>{
        displayName: option.description,
        key: option.buildingAttributeCodeId
      });
    });

    return fieldOptions;
  }

  private mapValues(currentFormModel: any): any {
    if (!this.buildingDto) {
      return currentFormModel;
    }

    for (const prop of Object.keys(this.buildingDto).concat(this.customFields)) {
      const formControl = currentFormModel.find(c => c.id === prop);

      // If this property maps to a dropdown and the type is string, make sure its lowercase to account for GUIDs in uppercase.
      if (PrimaryInfoDropDownModel.findIndex(pi => pi.name === prop) !== -1 && typeof this.buildingDto[prop] === 'string') {
        this.buildingDto[prop] = (<string>this.buildingDto[prop]).toLowerCase();
      }

      if (formControl) {

        formControl.value = this.mapValue(prop, formControl, formControl.value);

        if (formControl.type === FieldType.DropDown && formControl.options.length > 0) {
          formControl.options = this.helperService.sortCollection(formControl.options, 'displayName');
       }

      }
    }

    return currentFormModel;
  }

  private mapValidators(validators) {
    const formValidators = [];

    if (validators) {
      for (const validation of Object.keys(validators)) {
        if (validation === 'required') {
          formValidators.push(Validators.required);
        } else if (validation === 'min') {
          formValidators.push(Validators.min(validators[validation]));
        }
      }
    }
    return formValidators;
  }

  private mapValue(prop: string, formControl: any, formControlValue: any) {
    if (formControl) {
      if (formControl.type === FieldType.DateTime) {
          return this.buildingDto
          ? this.intl.parseDate(this.buildingDto[prop])
          : this.intl.parseDate(formControlValue);
      }

      if (formControl.type === FieldType.Percent) {
        return this.buildingDto
          ? this.intl.parseNumber(this.buildingDto[prop], 'p2', 'en')
          : this.intl.parseNumber(formControlValue, 'p2', 'en');
      }

      if (formControl.type === FieldType.Double) {
        return this.buildingDto
          ? this.intl.parseNumber(this.buildingDto[prop], 'n2', 'en')
          : this.intl.parseNumber(formControlValue, 'n2', 'en');
      }

      if (formControl.type === FieldType.Integer) {
        return this.buildingDto
          ? this.intl.parseNumber(this.buildingDto[prop], 'n', 'en')
          : this.intl.parseNumber(formControlValue, 'n', 'en');
      }
    }

    return this.buildingDto ? this.buildingDto[prop] : formControlValue;
  }

  handleAction(response: boolean) {
    this.showValuationErrorsButton = response;
  }

  private valuateBuilding() {
    this.buildingValuationComponent.open(false, this.selectedBuildings);
  }

  public handleCustomFieldLabelChange(field: FieldMetaDataDto) {
    const existingCustomField = this.editedCustomFields.find(f => f.name === field.name);
    if (existingCustomField) {
      existingCustomField.displayName = field.displayName;
    } else {
      this.editedCustomFields.push(field);
    }
  }
}
