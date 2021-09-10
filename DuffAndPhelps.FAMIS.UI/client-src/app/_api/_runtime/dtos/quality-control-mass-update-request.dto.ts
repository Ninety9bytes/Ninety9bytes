import { FilterDto } from "./filter.dto";

export interface QualityControlMassUpdateRequestDto {
  replaceField: string;
  replaceValue: string;
  filterTerms: Array<FilterDto>;
  filterConjunction: string;
}