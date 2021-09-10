import { SortTerm } from './sort-term.dto';
import { TransactionFilterTermDto } from './transaction-filter-term.dto';

export interface TransactionsSearchFilter {
  filterTerms: TransactionFilterTermDto[];
  filterConjunction: string;
  sortTerms: SortTerm[];
  skip: number;
  take: number;
}
