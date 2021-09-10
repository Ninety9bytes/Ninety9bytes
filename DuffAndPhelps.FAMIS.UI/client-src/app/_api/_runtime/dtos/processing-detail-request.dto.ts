import { SortTerm } from './sort-term.dto';

export interface ProcessingDetailRequestDto {
  recordsRequested: string;
  filterTerms: FilterTerm[];
  filterConjunction: string;
  sortTerms: SortTerm[];
  skip: number;
  take: number;
}

export interface FilterTerm {
  term: Term;
  operation: string;
}

export interface Term {
  dataTarget: number;
  field: string;
  value: string;
}

