import { AssetFileRecordDto } from '../asset-file-record-dto';

export interface ReconciliationValidationDto {
  isReconciliationComplete: boolean;
  isConsolidatedFileCreated: boolean;
  outOfBalanceAllocations: string[];
  missingMatches: string[];
  fullRecords: AssetFileRecordDto[];
}
export interface ReconciliationValidationDto {
  isReconciliationComplete: boolean;
  outOfBalanceAllocations: string[];
  missingMatches: string[];
  fullRecords: AssetFileRecordDto[];
}
