export class OneToManyMatchDto {
  constructor (
    public primaryAssetRecordId: string,
    public secondaryAssetRecordIds: string[],
    public isOneToOne: Boolean,
    public matchCodeId: string
  ) {}
}
export interface AssetRecordIds {
  assetRecordId: string;
}