import { AssetSearchTermDto } from "./asset-search-term.dto";

export interface AssetFilterTermDto {
    term: AssetSearchTermDto;
    operation: string;
  }