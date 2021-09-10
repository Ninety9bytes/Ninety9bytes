import { ReconciliationAllocationDto } from './reconcilation-allocation.dto';

export interface ReconciliationMatchDto {
  matchId?: string;
  assetFileRecordId?: string;
  parentAssetFileRecordId?: string;
  matchCodeId?: string;
  allocations?: Array<ReconciliationAllocationDto>;
}
