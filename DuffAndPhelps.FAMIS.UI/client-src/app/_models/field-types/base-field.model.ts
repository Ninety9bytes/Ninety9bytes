export class BaseField<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  fieldName: string;
  isCustomField: boolean;

  constructor(options: {
    value?: T,
    templateFieldId?: string,
    moduleId?: string,
    label?: string,
    required?: boolean,
    order?: number,
    controlType?: string,
    fieldName?: string,
    isCustomField?: boolean

  } = {}) {
    this.value = options.value;
    this.key = options.templateFieldId;
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.fieldName = options.fieldName || '';
    this.isCustomField = options.isCustomField || false;
  }
}
