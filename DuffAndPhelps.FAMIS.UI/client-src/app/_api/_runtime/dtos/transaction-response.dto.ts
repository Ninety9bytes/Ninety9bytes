import { TransactionValidationStatus } from '../enums/transaction-validation-status';
import { Asset } from '../../../_models/asset.model';
export interface TransactionResponseDto {
  status: string;
  impactedAssets: Array<Asset>;
  validationStatus: TransactionValidationStatus;
}