export class SetParentChildMatchDto {
  constructor(public parentAssetFileRecordId: string, public assetFileRecordIds: string[]) { }
}
