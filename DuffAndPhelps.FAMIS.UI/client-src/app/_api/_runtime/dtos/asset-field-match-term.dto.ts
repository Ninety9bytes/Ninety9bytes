import { AssetSearchTermDto } from "./asset-search-term.dto";

export interface AssetFieldMatchTermDto {
    leftTerm: AssetSearchTermDto;
    rightTerm: AssetSearchTermDto;
    operation: string;
    isNullOk: boolean;
  }