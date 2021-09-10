import { FieldMatchDto } from '../_api/dtos/inventory/field-match.dto';
import { FilterDto } from '../_api/dtos/inventory/filter.dto';
import { DataTargetName } from '../_enums/data-target-name';
import { SortTerm } from '../_api/_runtime/dtos/sort-term.dto';

export interface SearchRequest {
  matchCodeId: string;
  fieldMatchTerms: Array<FieldMatchDto>;
  fieldMatchConjunction: string;
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
  source: DataTargetName;
  groupId?: string;
  excludeMatchedRecords: boolean;
  sortTerms?: Array<SortTerm>;
  skip?: number;
  take?: number;
}
