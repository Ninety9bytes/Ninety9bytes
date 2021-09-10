import { AssetFieldMatchTermDto } from "./asset-field-match-term.dto";
import { AssetFilterTermDto } from "./asset-filter-term.dto";
import { AssetSortTermDto } from "./asset-sort-term.dto";

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
    source?: string;
  }
