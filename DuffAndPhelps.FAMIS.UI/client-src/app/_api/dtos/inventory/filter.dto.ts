import { FilterTermDto } from './filter-term.dto';

export interface FilterDto {
  id?: string;
  term: FilterTermDto;
  operation: string;
}
