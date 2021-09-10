import { BaseField } from './base-field.model';

export class DecimalField extends BaseField<string> {

  controlType = 'decimalnumber';

  constructor(options: {} = {}) {
    super(options);
  }

}
