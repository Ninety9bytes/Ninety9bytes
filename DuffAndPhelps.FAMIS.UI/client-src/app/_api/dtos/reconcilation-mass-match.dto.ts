export class ReconcilationMassMatchDto {
  constructor (
    public primaryAssetRecordId: string,
    public secondaryAssetRecordId: string,
    public isOneToOne: Boolean,
    public matchCodeId: string
  ) {}
}
