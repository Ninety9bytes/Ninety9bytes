import { TermDto } from './term.dto';

export interface TransactionFilterTermDto {
  term: TermDto;
  operation: string;
}
