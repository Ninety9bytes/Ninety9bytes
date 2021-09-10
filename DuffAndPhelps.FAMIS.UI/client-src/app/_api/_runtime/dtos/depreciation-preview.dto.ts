import { FilterDto } from './filter.dto';

export interface DepreciationPreviewDto {
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
  DayOneCalc: boolean;
  advancedDepreciationYears: number;
}
