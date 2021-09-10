import { RecordCount } from '../record-count.model';

export interface ContractsGroupSummaryDto {
  id: string;
  groupName: string;
  groupName2: string;
  location: string;
  groupNumber: string;
  lastUpdated: Date;
  recordCount: Array<RecordCount>;
  reconciliationProgress: string;
}
