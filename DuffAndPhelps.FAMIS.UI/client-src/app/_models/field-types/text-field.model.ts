import { BaseField } from './base-field.model';

export class TextField extends BaseField<string> {

  controlType = 'text';

  constructor(options: {} = {}) {
    super(options);
  }

}
