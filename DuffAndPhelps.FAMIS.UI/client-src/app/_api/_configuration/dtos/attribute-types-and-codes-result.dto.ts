
export interface AttributeTypesAndCodesResult {
  name: string;
  value: number;
  displayName: string;
  isSupported: boolean;
  options: AttributeTypeOption[];
}

export interface AttributeTypeOption {
  buildingAttributeCodeId: string;
  code: string;
  description: string;
}
