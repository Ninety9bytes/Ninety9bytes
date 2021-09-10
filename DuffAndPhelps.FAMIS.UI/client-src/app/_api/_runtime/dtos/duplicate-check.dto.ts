import { FilterTerm } from './processing-detail-request.dto';
import { SortTerm } from './sort-term.dto';

export interface DuplicateCheckRequestDto {
  field: string;
  filterTerms: FilterTerm[];
  filterConjunction: string;
  sortTerms: SortTerm[];
  skip: number;
  take: number;
}

