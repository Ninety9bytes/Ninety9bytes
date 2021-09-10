
export interface AssetSearchDto {
  matchCodeId?: string;
  fieldMatchTerms: AssetFieldMatchTermDto[];
  fieldMatchConjunction: string;
  filterTerms: AssetFilterTermDto[];
  filterConjunction: string;
  excludeMatchedRecords: boolean;
  sortTerms: AssetSortTermDto[];
  skip: number;
  take: number;
  includeAllAssetIds: boolean;
}

export interface AssetSortTermDto {
  termOrder: number;
  sortDirection: number;
  field: string;
}

export interface AssetFilterTermDto {
  term: AssetSearchTermDto;
  operation: string;
}

export interface AssetFieldMatchTermDto {
  leftTerm: AssetSearchTermDto;
  rightTerm: AssetSearchTermDto;
  operation: string;
  isNullOk: boolean;
}

export interface AssetSearchTermDto {
  dataTarget: number;
  field: string;
  value: string;
}

export interface AssetSearchResponseDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  assets: AssetSearchDataDto[];
  searchFilter: AssetSearchDto;
  allAssetIds: string[];
}

export interface AssetSearchDataDto {
  assetId: string;
  parentId: any;
  matchCodeId: any;
  matchCodeName: string;
  assetData: any;
}