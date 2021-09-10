import { FilterDto } from "./filter.dto";

export interface DepreciationSubmissionRequestDto {
  method: number;
  convention: number;
  dayOneCalc: boolean;
  futureYears: number;
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
  }