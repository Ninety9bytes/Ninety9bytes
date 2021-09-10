import { SpreadsheetColumnDto } from './spreadsheet-column.dto';
import { HeaderRow } from '../../_models/header-row.model';
import { DataTargetDescription } from '../../_models/data-target-description.model';

export class ExcelSummaryDto {

    constructor(
        public id: string,
        public spreadsheetColumns: Array<SpreadsheetColumnDto>,
        public spreadsheetFileName: string,
        public headerRow: HeaderRow,
        public dataTargetDescription: DataTargetDescription,
        public importErrors: Array<string>
    ) { }
}
