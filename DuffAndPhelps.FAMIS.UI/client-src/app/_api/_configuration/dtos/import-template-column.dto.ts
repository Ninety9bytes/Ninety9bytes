export interface ImportTemplateColumn {
  id: string;
  importTemplateId: string;
  name: string;
  destinationColumnName: string;
  destinationEntity: string;
  dataType: string;
  attributeType?: number;
  index: number;
  actualDataType?: any;
}
