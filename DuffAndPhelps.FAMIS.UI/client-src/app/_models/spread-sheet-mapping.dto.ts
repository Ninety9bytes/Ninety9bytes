import { ColumnMap } from './column-map.model';
import { ImportMode } from '../_enums/import-mode';

export interface SpreadSheetMappingDto {
  Mode: ImportMode;
  SpreadsheetMappings: ColumnMap[];
  UniqueIdentifierColumn: ColumnMap;
}
