import { BaseField } from './base-field.model';

export class DateField extends BaseField<string> {

  controlType = 'date';

  constructor(options: {} = {}) {
    super(options);
  }

}
