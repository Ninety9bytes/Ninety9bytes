export interface FamisViewModelField {
    value?: FamisViewModelFieldValue;
    isMultiline?: boolean;
    maxChars?: number;
    fieldName: string;
    fieldLabel: string;
    helpText: string;
    order: number;
    isReadOnly: boolean;
    isCustomField: boolean;
    isRequired: boolean;
    templateFieldId: string;
    moduleId: string;
    type: string;
    min?: number;
    max?: number;
  }

  export interface FamisViewModelFieldValue {
    text: string;
    value: string;
  }