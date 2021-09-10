import { TransactionType } from '../enums/transaction-type';
import { TransactionApplicability } from '../enums/transaction-applicability';
import { DisposalCode } from '../enums/disposal-code';

export interface TransactionRequestDto {
  transactionType: TransactionType;
  transactionApplicability: TransactionApplicability;
  assets: string[];
  asOf: string;
  costChange: number;
  quantityChange: number;
  accumChange: number;
  transferFields: TransferFieldDto[];
  disposalCode: DisposalCode;
  prorateValues: boolean;
}
export interface TransferFieldDto {
  destinationField: string;
  destinationValue: string;
}
