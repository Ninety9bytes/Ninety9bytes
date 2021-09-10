export class UploadSpreadsheetDto {

    constructor(
        public groupId?: string,
        public dataTargetId?: string,
        public dataTargetName?: string,
        public projectid?: string,
        public localeId?: string,
        public file?: File,
        public fileName?: string
    ) { }
}
