export class ImportResultDto {

    constructor(
        public success?: boolean,
        public rowsAdded?: number,
        public rowsUpdated?: number,
        public errors?: string[],
        public name?: string
    ) { }
}
