import { SortTerm } from '../_api/_runtime/dtos/sort-term.dto';

export interface MassMatchGridState {
  skip: number;
  take: number;
  sortTerm?: SortTerm;
}
