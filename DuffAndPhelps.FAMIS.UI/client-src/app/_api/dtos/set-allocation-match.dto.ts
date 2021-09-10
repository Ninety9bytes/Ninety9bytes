import { ReconciliationAllocationDto } from './reconcilation-allocation.dto';

export class SetAllocationMatchCodeDto {
  constructor(public assetRecordId: string, public matchCodeId: string, public allocations: Array<ReconciliationAllocationDto>) { }
}
