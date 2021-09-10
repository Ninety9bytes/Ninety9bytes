import { SortTerm } from './sort-term.dto';

export interface MassUpdateDetailRequestDto {
  filterTerms: FilterTerm[];
  filterConjunction: string;
  sortTerms: SortTerm[];
  skip: number;
  take: number;
}

interface FilterTerm {
  term: Term;
  operation: string;
}

interface Term {
  dataTarget: number;
  field: string;
  value: string;
}

