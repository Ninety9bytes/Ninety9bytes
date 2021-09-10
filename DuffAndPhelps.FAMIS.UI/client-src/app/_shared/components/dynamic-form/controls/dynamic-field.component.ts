import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { Component, OnChanges, OnInit, Input, ComponentRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FieldType } from '../../../../_enums/field-type';
import { FormField } from '../../../../_models/form-field.model';
import { FormGroup } from '@angular/forms';
import { IntlService } from '@progress/kendo-angular-intl';
import { FieldMetaDataDto } from '../../../../_api/dtos/inventory/field-meta-data.dto';

@Component({
  selector: 'dynamic-field',
  templateUrl: './dynamic-field.component.html'
})
export class DynamicFieldComponent implements OnInit, OnChanges, AfterViewInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  fieldTypes = FieldType;

  @Input() canRemove: boolean;
  @Input() field: FormField;
  @Input() form: FormGroup;
  @Input() key: string;
  @Input() value: string | Date;
  @Input() entityId: string;
  @Input() imageEntityType: number;
  @Input() sourceTranslationKey = '';

  @Output() customFieldLabelChange: EventEmitter<FieldMetaDataDto> = new EventEmitter();

  hasMinProperty = false;

  translationBaseKey: boolean;
  ref: ComponentRef<DynamicFieldComponent>;
  dateValue: Date;

  constructor(private intl: IntlService) {}

  ngOnInit(): void {
    if (this.field.type === this.fieldTypes.Date || 
      this.field.type === this.fieldTypes.DateTime) {
        this.dateValue = this.field.value;
    }

    if (this.field.type === this.fieldTypes.Double) {
      this.field.decimalLength = this.field.decimalLength ? this.field.decimalLength : 2;
      this.field.format = this.field.format ? this.field.format : 'n2';
    }

    if (this.field.type === this.fieldTypes.Percent) {
      this.field.decimalLength = this.field.decimalLength ? this.field.decimalLength : 2;
      this.field.format = this.field.format ? this.field.format : '#\\%';
    }
  }

  ngAfterViewInit() {
    if (this.dateValue) {
      if (this.isTimePresent(this.dateValue)) {
        this.dateValue = new Date(this.removeTimeZoneOffsetFromDate(this.dateValue));
      } else {
        this.dateValue.setTime(this.removeTimeZoneOffsetFromDate(this.dateValue));
      }
    }
  }

  ngOnChanges(): void {
    this.hasMinProperty = this.field && typeof this.field.min === 'number' ? true : false;
  }

  public onChange(value: Date): void {
    if (value) {
      value.setHours(0, 0, 0, 0);
      this.dateValue.setTime(this.removeTimeZoneOffsetFromDate(value));
    }
  }

  get isValid(): boolean {
    return this.form.controls[this.field.id] ? this.form.controls[this.field.id].valid : false;
  }

  remove() {
    this.ref.destroy();
  }

  private removeTimeZoneOffsetFromDate(date: Date) {
    const timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    return (date.getTime() - timeOffsetInMS);
  }

  private isTimePresent(inputDate: Date) {
    if(inputDate.getHours() === 0
    && inputDate.getMinutes() === 0
    && inputDate.getSeconds() === 0
    && inputDate.getMilliseconds() === 0) {
      return false;
    }
    return true;
  }

  public customLabelChange($event: any, field: FormField) {
    const newDisplayName = $event.target.innerText.trim();
    if (!!newDisplayName && newDisplayName !== field.displayName) {
      this.customFieldLabelChange.emit(<FieldMetaDataDto> {
        displayName: newDisplayName,
        name: field.name,
        isCustom: true
      });
    } else {
      $event.target.innerText = field.displayName;
    }
  }
}
