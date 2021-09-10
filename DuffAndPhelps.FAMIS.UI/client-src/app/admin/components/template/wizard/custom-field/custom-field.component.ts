import { TemplateService } from '../../../../services/template.service';
import { TranslatedComponent } from '../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../_core/i18n/translation-base-keys';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TemplateFieldBaseDto } from '../../../../../_api/dtos/template-management/template-field-base.dto';

@Component({
  selector: 'app-custom-field',
  templateUrl: './custom-field.component.html'
})
export class CustomFieldComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  form: FormGroup;
  formArray: FormArray;
  customFieldFormArray = new FormArray([new FormControl()]);

  @Input() customFields: Array<TemplateFieldBaseDto> = new Array<TemplateFieldBaseDto>();
  @Input() moduleId: string;

  @Input() invalidFieldTypeIndexes: string[];
  @Input() invalidFieldNameIndexes: Array<[string, string]>;
  @Output() customFieldAdded = new EventEmitter<TemplateFieldBaseDto>();
  @Output() customFieldRemoved = new EventEmitter<string>();
  @Input() isEditTemplate: boolean;

  constructor(private formBuilder: FormBuilder, private templateService: TemplateService) {}

  ngOnInit(): void {

    this.formArray = this.formBuilder.array([]);

    this.form = this.formBuilder.group({
      customFields: this.formArray
    });

    this.customFields.forEach(field => {
      if (field.moduleId === this.moduleId) {
        const control = <FormArray>this.form.controls['customFields'];
        control.push(this.initCustomFields(field));
      }
    });

   this.form.valueChanges.subscribe(val => {
      const customField = <Array<TemplateFieldBaseDto>>val;
      this.customFieldAdded.emit(val.customFields);
      // console.log(val);
    });
  }

  initCustomFields(field?: TemplateFieldBaseDto) {
    return this.formBuilder.group({
      id: [field ? field.id : this.generateUUID()],
      isCustomField: [true],
      moduleId: this.moduleId,
      name: [field ? field.name : '', Validators.required],
      fieldType: [field ? field.fieldType : '', Validators.required],
      order: [field && field.order > 0 ? field.order : 0]
    });
  }

  addNewRow() {
    const control = <FormArray>this.form.controls['customFields'];
    control.push(this.initCustomFields());

  }

  // Todo: Check if this is still needed
  private generateUUID() {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // tslint:disable-next-line: no-bitwise
      const r = ((d + Math.random() * 16) % 16) | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line: no-bitwise
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }

  isSelectFieldDirty(c: FormControl): boolean {
    const fieldId = c.value.id;
    return this.invalidFieldTypeIndexes.find(item => item === fieldId) != null;
  }

  isNameFieldDirty(c: FormControl): boolean {
    const fieldId = c.value.id;
    return this.invalidFieldNameIndexes.find(item => item[0] === fieldId) != null;
  }

  GetNameFieldErrors(c: FormControl): string {
    let res = '';
    const fieldId = c.value.id;
    const errorTuple = this.invalidFieldNameIndexes.find(x => x[0] === fieldId);
    if (errorTuple != null){
      res += errorTuple[1];
    }
    return res;
  }

  deleteRow(c: FormControl) {
    const fieldId = c.value.id;
    const index = this.customFields.findIndex(f => f.id === fieldId);
    if (index !== -1) {
      this.customFields.splice(index, 1);
      const controlIndex = this.formArray.controls.findIndex(f => f.value.id === fieldId);
      this.formArray.controls.splice(controlIndex, 1);
    }
    this.customFieldRemoved.emit(fieldId);
  }

}
