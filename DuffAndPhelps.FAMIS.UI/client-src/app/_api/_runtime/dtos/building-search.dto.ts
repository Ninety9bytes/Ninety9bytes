import { BuildingFilterTermDto } from './building-filter-term.dto';
import { BuildingSortTermDto } from './building-sort-term.dto';

export interface BuildingSearchDto {
    filterTerms: BuildingFilterTermDto[];
    filterConjunction: string;
    sortTerms: BuildingSortTermDto[];
    skip: number;
    take: number;
  }