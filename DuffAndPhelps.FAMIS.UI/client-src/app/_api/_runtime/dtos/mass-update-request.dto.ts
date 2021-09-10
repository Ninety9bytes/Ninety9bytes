import { FilterTerm } from './processing-detail-request.dto';
import { SortTerm } from './sort-term.dto';
import { MassUpdateRequestAdvancedTermDto } from './mass-update-request-advanced-term.dto';

export interface MassUpdateRequestDto {
  field: string;
  textReplaceValue: string;
  advancedReplaceOperation: MassUpdateRequestAdvancedTermDto;
  filterTerms: FilterTerm[];
  filterConjunction: string;
  sortTerms: SortTerm[];
  skip: number;
  take: number;
}