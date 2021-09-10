export interface ParentChildMatchResult {
  code?: number;
  entities?: ParentChildMatchEntity[];
}

export interface ParentChildMatchEntity {
  assetFileRecordId: string;
  matchCodeId: string;
  matchId: string;
  parentAssetFileRecordId: string;
}