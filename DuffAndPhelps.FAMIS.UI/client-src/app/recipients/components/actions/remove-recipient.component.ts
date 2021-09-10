import { HelperService } from '../../../_core/services/helper.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { RecipientDto } from '../../../_api/_runtime/dtos/recipient.dto';
import { FormActionEvent } from '../../../_models/form-action-event.model';
import { FieldCategory } from '../../../_enums/field-category';
import { FormGroup } from '@angular/forms';
import { FormField } from '../../../_models/form-field.model';
import { FormAction } from '../../../_enums/form-action';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';

@Component({
  selector: 'remove-recipient',
  templateUrl: 'remove-recipient.component.html'
})
export class RemoveRecipientComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  recipientDto = <RecipientDto>{ id: '' };
  fieldMetaData = new Array<FieldMetaDataDto>();
  submitResponse = new EventEmitter<FormActionEvent>();

  public isSaving = false;

  public FieldCategory: FieldCategory;

  form: FormGroup;
  defaultFormFields = new Array<FormField>();

  fields = new Array<FormField>();

  constructor(private helperService: HelperService) { }

  ngOnInit() {

    this.fieldMetaData.forEach((field, index) => {
      this.defaultFormFields.push(this.mapMetaDataToField(field, index + 1));
    });

    this.form = this.helperService.toFormGroup(this.defaultFormFields);
  }

  remove(): void {
    this.isSaving = true;

    const recipientDto = Object.assign(this.form.value, { id: this.recipientDto.id });

    this.submitResponse.emit({ action: FormAction.Remove, formGroup: this.form, dto: recipientDto });
  }

  cancel(): void {
    this.submitResponse.emit({ action: FormAction.Cancel });
  }

  private mapMetaDataToField(field: FieldMetaDataDto, defaultOrder?: number): FormField {
    // console.log(this.recipientDto);
    return <FormField>{
      id: field.name,
      type: field.fieldType,
      value: this.recipientDto ? this.mapValue(field, this.recipientDto[field.name]) : '',
      displayName: field.displayName,
      options: field.options,
      cascadedValueOptions: field.cascadedValueOptions,
      cascadedValues: field.cascadedValues,
      order: defaultOrder
    };
  }

  private mapValue(field: FieldMetaDataDto, value: string): string {

    return value;
  }

}
