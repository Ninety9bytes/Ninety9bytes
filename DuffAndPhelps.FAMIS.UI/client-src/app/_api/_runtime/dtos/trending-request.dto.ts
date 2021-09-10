import { FilterDto } from "./filter.dto";

export interface TrendingRequestDto {
  sourceField: string;
  destinationField: string;
  rounding: number;
  trendingTableId: string;
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
}