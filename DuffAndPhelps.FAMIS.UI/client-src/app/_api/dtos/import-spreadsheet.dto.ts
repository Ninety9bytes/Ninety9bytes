import { SpreadSheetMappingDto } from '../../_models/spread-sheet-mapping.dto';

export class ImportSpreadsheetDto {

    constructor(
        public id: string,
        public groupId: string,
        public importTemplateId: string,
        public rows: number,
        public mapping: SpreadSheetMappingDto
    ) { }
}
