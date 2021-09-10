import { TransactionSummaryFieldDto } from './transaction-revert-summary-current.dto';

export interface RevertSummaryDto {
  transactionType: string;
  assetTagNumber?: string;
  headers: TransactionSummaryFieldDto[];
  current: TransactionAssetSummaryDto[];
  previous: TransactionAssetSummaryDto;
}

export interface TransactionAssetSummaryDto {
  historicalCost: number;
  quantity: number;
  costReplacementNew: number;
  accumulateddepreciation: number;
  salvageValue: number;
  account: number;
  department: number;
  site: number;
  building: number;
  floor: number;
  room: number;
}
