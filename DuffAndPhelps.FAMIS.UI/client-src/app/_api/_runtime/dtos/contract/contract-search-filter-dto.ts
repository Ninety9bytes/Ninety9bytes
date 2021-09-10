import { ContractSummaryDto } from '../../../dtos/contract-summary.dto';

export interface ContractSearchDto {
  filterTerms: ContractFilterTermDto[];
  filterConjunction: string;
  sortTerms: ContractSortTermDto[];
  skip: number;
  take: number;
}

export interface ContractFilterTermDto {
  term: ContractSearchTermDto;
  operation: string;
}

export interface ContractSortTermDto {
  termOrder: number;
  sortDirection: number;
  field: string;
}

export interface ContractSearchTermDto {
  field: string;
  value: string;
}

export interface ContractGridSearchResultsDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  contractSummaries: Array<ContractSummaryDto>;
}
