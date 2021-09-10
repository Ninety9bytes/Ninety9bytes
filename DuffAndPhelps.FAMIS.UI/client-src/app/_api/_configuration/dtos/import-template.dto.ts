import { ImportTemplateColumn } from './import-template-column.dto';

export interface ImportTemplateDto {
  importTemplateColumns: ImportTemplateColumn[];
  id: string;
  name: string;
  dataTarget: number;
  importTemplateType: number;
}
