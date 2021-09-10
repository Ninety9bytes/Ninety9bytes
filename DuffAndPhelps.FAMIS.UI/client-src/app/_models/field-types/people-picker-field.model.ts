import { BaseField } from './base-field.model';
export class PeoplePickerField extends BaseField<string> {
  controlType = 'peoplePicker';
  public displayValue: string;
  constructor(options: {} = {}) {
    super(options);
    this.displayValue = options['displayValue'] || undefined;
  }
}
