import { FilterDto } from './filter.dto';
import { FieldMatchDto } from './field-match.dto';
import { DataTargetName } from '../../../_enums/data-target-name';

export interface SearchRequestDto {
  matchCodeId: string;
  fieldMatchTerms: Array<FieldMatchDto>;
  fieldMatchConjunction: string;
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
  source: DataTargetName;
}
