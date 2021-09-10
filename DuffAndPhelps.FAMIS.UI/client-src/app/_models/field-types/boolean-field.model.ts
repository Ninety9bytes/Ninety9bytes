import { BaseField } from './base-field.model';

export class BooleanField extends BaseField<boolean> {

 controlType = 'boolean';

  constructor(options: {} = {}) {
    super(options);
  }

}
