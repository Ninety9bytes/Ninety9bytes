import { SelectOption } from '../select-option.model';

export class ConsolidationDropDownField  {
  selectOptions: Array<SelectOption> = [];
  value: string;
  key: string;
  label: string;

  constructor(options: {
    value?: string,
    key?: string,
    label?: string,
    selectOptions?: Array<SelectOption>
  } = {}) {

    this.key = options.key || '';
    this.value = options.value || '';
    this.label = options.label || '';
    this.selectOptions = options.selectOptions || [];
  }

}
