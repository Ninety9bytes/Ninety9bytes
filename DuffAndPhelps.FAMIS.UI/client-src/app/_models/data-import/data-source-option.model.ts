import { SpreadsheetColumnDto } from '../../_api/dtos/spreadsheet-column.dto';

export interface DataSourceOption {
  isMapped: boolean;
  column: SpreadsheetColumnDto;
}
