import { TranslatedComponent } from '../../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../../_core/i18n/translation-base-keys';
import { HelperService } from '../../../../../../../_core/services/helper.service';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { UserFactorDto } from '../../../../../../../_api/_runtime/dtos/building.dto';
import { FieldMetaDataDto } from '../../../../../../../_api/dtos/inventory/field-meta-data.dto';
import { FormActionEvent } from '../../../../../../../_models/form-action-event.model';
import { FormAction } from '../../../../../../../_enums/form-action';
import { FieldCategory } from '../../../../../../../_enums/field-category';
import { FormGroup } from '@angular/forms';
import { FormField } from '../../../../../../../_models/form-field.model';

@Component({
  selector: 'upsert-userfactor',
  templateUrl: 'upsert-userfactor.component.html'
})
export class UpsertUserFactorComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  userFactorDto: UserFactorDto;
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
    private helperService: HelperService,
  ) { }

  ngOnInit() {

    this.fieldMetaData.forEach((field, index) => {
      this.defaultFormFields.push(this.mapMetaDataToField(field, index + 1));
    });

    this.action = this.formAction === 0 ? 'Add' : 'Edit';
    this.form = this.helperService.toFormGroup(this.defaultFormFields);
  }

  save(): void {
    if (!this.userFactorDto) {
      this.userFactorDto = <UserFactorDto> {};
    }
    this.userFactorDto.factor = this.form.value.factor;
    this.userFactorDto.description = this.form.value.description;
    this.submitResponse.emit({ action: this.formAction, formGroup: this.form, dto: this.userFactorDto });
  }

  cancel(): void {
    this.submitResponse.emit({ action: FormAction.Cancel });
  }

  private mapMetaDataToField(field: FieldMetaDataDto, defaultOrder?: number): FormField {
    return <FormField>{
      id: field.name,
      type: field.fieldType,
      value: this.userFactorDto ? this.mapFieldToValue(field) : '',
      displayName: field.displayName,
      options: field.options,
      cascadedValueOptions: field.cascadedValueOptions,
      cascadedValues: field.cascadedValues,
      order: defaultOrder,
      required: true
    };
  }

  mapFieldToValue(field: FieldMetaDataDto) {
    let factor: number;

    if (field.name === 'factor') {
      factor = parseFloat(this.userFactorDto[field.name]);
    }

    return factor !== undefined ? factor : this.userFactorDto[field.name];
  }

}
