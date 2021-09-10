export class ManyToOneMatchDto {
  constructor (
    public primaryAssetRecordIds: string[],
    public secondaryAssetRecordId: string,
    public isOneToOne: Boolean,
    public matchCodeId: string
  ) {}
}
export interface AssetRecordIds {
  assetRecordId: string;
}
