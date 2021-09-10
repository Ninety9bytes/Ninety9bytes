import { BaseField } from './base-field.model';

export class DropDownField extends BaseField<string> {

  controlType = 'dropdown';

  dropDownOptions: { key: string, value: string }[] = [];

  constructor(options: {} = {}) {
    super(options);
    this.dropDownOptions = options['dropDownOptions'] || [];
  }

}
