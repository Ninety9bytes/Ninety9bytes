import { ColumnMap } from './column-map.model';
import { ExcelSummaryDto } from '../_api/dtos/excel-summary.dto';
import { UploadSpreadsheetDto } from '../_api/dtos/upload-spreadsheet.dto';

export class DataImport {
  constructor(
    public spreadsheetUpload?: UploadSpreadsheetDto,
    public excelSummary?: ExcelSummaryDto,
    public mapping: Array<ColumnMap> = new Array<ColumnMap>()
  ) {}
}