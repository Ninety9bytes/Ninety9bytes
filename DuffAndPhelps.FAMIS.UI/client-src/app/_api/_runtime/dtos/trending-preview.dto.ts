import { FilterDto } from './filter.dto';

export interface TrendingPreviewDto {
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
  startingValue: number;
  endingValue: number;
}
