import { HelperService } from '../../../_core/services/helper.service';
import { DefaultAssetFields } from './default-asset-fields';
import { BuildingInfoService } from '../../../_core/services/building-info-service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { AlertService } from '../../../_core/services/alert.service';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { AssetDto } from '../../../_api/_runtime/dtos/asset.dto';
import { ImageEntityType } from '../../../_api/_runtime/enums/image-entity-type';
import { FormActionEvent } from '../../../_models/form-action-event.model';
import { FieldCategory } from '../../../_enums/field-category';
import { FormGroup, NgForm } from '@angular/forms';
import { FormField } from '../../../_models/form-field.model';
import { IntlService } from '@progress/kendo-angular-intl';
import { FieldType } from '../../../_enums/field-type';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';
import { FormAction } from '../../../_enums/form-action';

@Component({
  selector: 'asset-form',
  templateUrl: './asset-form.component.html'
})
export class AssetFormComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input()
  assetDto = <AssetDto>{ id: '' };
  @Input()
  fieldMetaData = new Array<FieldMetaDataDto>();
  @Input()
  isModal = false;
  @Input()
  imageEntityType: ImageEntityType;
  @Output()
  formActionEvent = new EventEmitter<FormActionEvent>();
  @Input()
  isReadOnly = false;
  @Input()
  savingForm: boolean;

  @Input()
  translationKey: string;

  @Input()
  depreciationFieldMetadata = new Array<FieldMetaDataDto>();

  public isSaving = false;

  public FieldCategory: FieldCategory;

  formGroup: FormGroup;
  @ViewChild('assetForm', { static: false })
  assetForm: NgForm;

  defaultFormFields = new Array<FormField>();
  generalFormFields = new Array<FormField>();
  customFormFields = new Array<FormField>();
  depreciationFields = new Array<FormField>();


  fields = new Array<FormField>();

  private editedCustomFields: Array<FieldMetaDataDto> = [];

  constructor(
    private helperService: HelperService,
    private buildingInfoService: BuildingInfoService,
    private intl: IntlService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {

    console.log(this.fieldMetaData, 'fieldMetaData asset-form');

    this.fieldMetaData.forEach(field => {
      if (field.name === 'assetImages') {
        field.fieldType = FieldType.Image;
      }

      const defaultField = DefaultAssetFields.find(c => c.id === field.name);

      if (field.name === 'matchCodeName') {
        field.fieldType = FieldType.ReadOnly;
      }

      if (field.fieldType === FieldType.DropDown) {
        if (field.options && field.options.length > 0) {
         field.options = this.helperService.sortCollection(field.options, 'displayName');

        }
      }

      if (defaultField) {
        this.defaultFormFields.push(this.mapMetaDataToField(field, defaultField.order));
      }

      if (!defaultField && !field.isCustom && this.depreciationFieldMetadata.findIndex(df => df.name === field.name) === -1) {
        this.generalFormFields.push(this.mapMetaDataToField(field));
      }

      if (!defaultField && field.isCustom) {
        this.customFormFields.push(this.mapMetaDataToField(field));
      }
    });

    if (this.depreciationFieldMetadata && this.depreciationFieldMetadata.length > 0) {
      this.depreciationFields = this.depreciationFieldMetadata.map(f => this.mapMetaDataToField(f));
    }

    const depreciationAsOfDate = this.depreciationFields.find(c => c.id === 'depreciationAsOfDate');

    if (depreciationAsOfDate) {
      depreciationAsOfDate.isReadOnly = true;
    }


    this.formGroup = this.helperService
      .toFormGroup(this.generalFormFields
        .concat(this.defaultFormFields)
        .concat(this.customFormFields)
        .concat(this.depreciationFields));
  }

  save(formAction: FormAction): void {
    this.isSaving = true;
    const assetDto = this.formGroup.value;
    if (assetDto.buildingId && assetDto.buildingId.indexOf(',') > 0) {
      [, assetDto.siteId, assetDto.buildingId] = assetDto.buildingId.split(',');
      if (assetDto.siteId.indexOf('blank') !== -1) {
        assetDto.siteId = '';
      }
    }
    if (this.validAssetDto(assetDto)) {
      assetDto.customColumns = this.editedCustomFields;
      this.formActionEvent.emit({ action: formAction, formGroup: this.formGroup, form: this.assetForm, dto: assetDto });
    } else {
      this.alertService.error('Missing required fields');
      this.isSaving = false;
    }
  }

  private validAssetDto(assetDto: AssetDto): boolean {
    if (!assetDto.buildingId) {
      return false;
    }
    return true;
  }

  getTranslationKey(fieldKey: string): string {
    return this.translationKey ? this.translationKey : fieldKey;
  }

  cancel(): void {
    this.formActionEvent.emit({ action: FormAction.Cancel });
  }

  keepFormOpen(): void {
    this.save(FormAction.KeepOpen);
    this.isSaving = false;
  }

  saveAndClose(): void {
    this.save(FormAction.Save);
  }

  private mapMetaDataToField(field: FieldMetaDataDto, defaultOrder?: number): FormField {
    return <FormField>{
      id: field.name,
      type: field.fieldType,
      value: this.assetDto ? this.mapValue(field, this.assetDto[field.name]) : '',
      displayName: field.displayName,
      name: field.name,
      options: field.options,
      cascadedValueOptions: field.cascadedValueOptions,
      cascadedValues: field.cascadedValues,
      order: defaultOrder,
      required: field.required,
      translationKey: field.translationKey
    };
  }

  private mapValue(field: FieldMetaDataDto, value: string) {
    if (field.fieldType === FieldType.DateTime) {
      return this.intl.parseDate(value);
    }

    if (field.fieldType === FieldType.Double) {
      return this.intl.parseNumber(value, 'n2', 'en');
    }

    if (field.fieldType === FieldType.Integer) {
      return this.intl.parseNumber(value, 'n', 'en');
    }

    return field.name === 'buildingId' ? this.buildingInfoService.mapBuildingSelection(value, field.cascadedValueOptions) : value;
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
