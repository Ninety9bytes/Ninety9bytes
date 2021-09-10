import { SpreadsheetColumnDto } from '../_api/dtos/spreadsheet-column.dto';

export interface ColumnMap {
  spreadsheetColumn?: SpreadsheetColumnDto;
  dataTargetField?: string;
  importTemplateColumnId?: string;
  isAutoMapped?: boolean;
  isCustom?: boolean;
  columnDataType?: number;
  colLength?: number;
}

