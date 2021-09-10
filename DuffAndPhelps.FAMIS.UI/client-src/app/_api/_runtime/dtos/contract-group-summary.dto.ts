import { RecordCount } from './record-count.dto';

export interface ContractGroupSummaryDto {
  id: string;
  groupName: string;
  groupName2: string;
  location: string;
  groupNumber: string;
  lastUpdated: Date;
  recordCount: Array<RecordCount>;
  reconciliationProgress: string;
}
