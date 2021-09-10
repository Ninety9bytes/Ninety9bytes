import { BaseField } from './base-field.model';

export class WholeNumberField extends BaseField<string> {

  controlType = 'wholenumber';

  constructor(options: {} = {}) {
    super(options);
  }

}
