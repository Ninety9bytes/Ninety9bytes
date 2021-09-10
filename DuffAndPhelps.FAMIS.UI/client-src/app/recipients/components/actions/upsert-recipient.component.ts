import { HelperService } from '../../../_core/services/helper.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../../_core/i18n/translation-manager';
import { Component, OnInit, EventEmitter } from '@angular/core';
import { RecipientDto } from '../../../_api/_runtime/dtos/recipient.dto';
import { FormActionEvent } from '../../../_models/form-action-event.model';
import { FormAction } from '../../../_enums/form-action';
import { FieldCategory } from '../../../_enums/field-category';
import { FormGroup } from '@angular/forms';
import { FormField } from '../../../_models/form-field.model';
import { FieldMetaDataDto } from '../../../_api/dtos/inventory/field-meta-data.dto';
import { Deliverable } from '../../../_api/_runtime/enums/recipient-deliverable';

@Component({
  selector: 'upsert-recipient',
  templateUrl: 'upsert-recipient.component.html'
})
export class UpsertRecipientComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  recipientDto: RecipientDto;
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
    private translateService: TranslationManager
  ) { }

  ngOnInit() {

    this.fieldMetaData.forEach((field, index) => {
      this.defaultFormFields.push(this.mapMetaDataToField(field, index + 1));
    });

    this.action = this.formAction === 0 ? 'Add' : 'Edit';
    this.form = this.helperService.toFormGroup(this.defaultFormFields);
  }

  save(): void {
    this.isSaving = true;

    const mappedFormValues = this.mapDeliverablesToApi(this.form.value);
    let updatedRecipientDto = <RecipientDto>{};

    if (this.recipientDto) {
      updatedRecipientDto = Object.assign(mappedFormValues, { id: this.recipientDto.id });
    } else {
      updatedRecipientDto = Object.assign(mappedFormValues);
    }

    this.submitResponse.emit({ action: this.formAction, formGroup: this.form, dto: updatedRecipientDto });
  }

  cancel(): void {
    this.submitResponse.emit({ action: FormAction.Cancel });
  }

  private mapDeliverablesToApi(formValues) {
    formValues.deliverables = formValues.deliverables.length ? formValues.deliverables.split(', ').map((enumValue) => {
        return { deliverable: Number(enumValue) };
    }) : [];
    return formValues;
  }

  private mapMetaDataToField(field: FieldMetaDataDto, defaultOrder?: number): FormField {
    return <FormField>{
      id: field.name,
      type: field.fieldType,
      value: this.recipientDto ? this.mapValue(field, this.recipientDto[field.name]) : '',
      displayName: field.displayName,
      options: field.options,
      cascadedValueOptions: field.cascadedValueOptions,
      cascadedValues: field.cascadedValues,
      order: defaultOrder,
      required: field.required
    };
  }

  private mapDeliverablesToEnum(value: string): string {
    return value.split(', ').map((deliverableNum): string => {
      return Deliverable[deliverableNum];
    }).join(', ');
  }

  private mapValue(field: FieldMetaDataDto, value: string): string {
    return field.name === 'deliverables' ? this.mapDeliverablesToEnum(value) : value;
  }

}
