import { ColumnMap } from './column-map.model';

export class HeaderRow {

    constructor(
        public isCalculated: boolean,
        public confidence: string,
        public row: number,
        public columnMapping: Array<ColumnMap>
    ) { }

}
