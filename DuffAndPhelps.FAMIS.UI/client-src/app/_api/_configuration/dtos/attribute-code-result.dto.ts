export interface AttributeCodeResult {
  code: number;
  result: AttributeCode[];
}

export interface AttributeCode {
  buildingAttributeCodeId: string;
  code: string;
  description: string;
}