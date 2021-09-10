import { Transaction } from './transaction.dto';
import { TransactionsSearchFilter } from './transactions-search-filter.dto';

export interface TransactionsDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  transactions: Transaction[];
  searchFilter: TransactionsSearchFilter;
}
