import { BaseField } from './base-field.model';

export class MultiLineTextField extends BaseField<string> {

  controlType = 'textarea';

  constructor(options: {} = {}) {
    super(options);
  }

}
