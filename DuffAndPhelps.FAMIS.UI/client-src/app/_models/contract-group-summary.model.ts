import { RecordCountSummary } from './record-count-summary.model';

export interface ContractsGroupSummary {
  id: string;
  groupName: string;
  groupName2: string;
  location: string;
  groupNumber: string;
  lastUpdated: Date;
  recordCount: Array<RecordCountSummary>;
}
