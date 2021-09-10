import { HelperService } from '../../../../../../../_core/services/helper.service';
import { TranslatedComponent } from '../../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../../_core/i18n/translation-base-keys';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { CustomAddtionDto } from '../../../../../../../_api/_runtime/dtos/building.dto';
import { FieldMetaDataDto } from '../../../../../../../_api/dtos/inventory/field-meta-data.dto';
import { FormActionEvent } from '../../../../../../../_models/form-action-event.model';
import { FormAction } from '../../../../../../../_enums/form-action';
import { FieldCategory } from '../../../../../../../_enums/field-category';
import { FormGroup } from '@angular/forms';
import { FormField } from '../../../../../../../_models/form-field.model';

@Component({
  selector: 'upsert-customaddition',
  templateUrl: 'upsert-customaddition.component.html'
})
export class UpsertCustomAdditionComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  customAdditionDto: CustomAddtionDto;
  fieldMetaData = new Array<FieldMetaDataDto>();
  submitResponse = new EventEmitter<FormActionEvent>();
  formAction: FormAction;
  action: string;

  public isSaving = false;

  public FieldCategory: FieldCategory;

  form: FormGroup;
  defaultFormFields = new Array<FormField>();

  fields = new Array<FormField>();

  constructor(
    private helperService: HelperService
  ) { }

  ngOnInit() {

    this.fieldMetaData.forEach((field, index) => {
      this.defaultFormFields.push(this.mapMetaDataToField(field, index + 1));
    });

    this.action = this.formAction === 0 ? 'Add' : 'Edit';
    this.form = this.helperService.toFormGroup(this.defaultFormFields);
  }

  save(): void {
    if (!this.customAdditionDto) {
      this.customAdditionDto = <CustomAddtionDto>{};
    }
    this.customAdditionDto.cost = this.form.value.cost;
    this.customAdditionDto.description = this.form.value.description;
    this.submitResponse.emit({ action: this.formAction, formGroup: this.form, dto: this.customAdditionDto });
  }

  cancel(): void {
    this.submitResponse.emit({ action: FormAction.Cancel });
  }

  private mapMetaDataToField(field: FieldMetaDataDto, defaultOrder?: number): FormField {
    return <FormField>{
      id: field.name,
      type: field.fieldType,
      value: this.customAdditionDto ? this.mapFieldToValue(field) : '',
      displayName: field.displayName,
      options: field.options,
      cascadedValueOptions: field.cascadedValueOptions,
      cascadedValues: field.cascadedValues,
      order: defaultOrder,
      required: true
    };
  }

  mapFieldToValue(field: FieldMetaDataDto) {
    let cost: number;
    if (field.name === 'cost') {
      cost = parseFloat(this.customAdditionDto[field.name]);
    }
    return cost !== undefined ? cost : this.customAdditionDto[field.name];
  }

}
