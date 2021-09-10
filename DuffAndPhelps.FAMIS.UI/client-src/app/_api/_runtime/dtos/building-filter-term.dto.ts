import { BuildingSearchTermDto } from './building-search-term.dto';

export interface BuildingFilterTermDto {
    term: BuildingSearchTermDto;
    operation: string;
  }