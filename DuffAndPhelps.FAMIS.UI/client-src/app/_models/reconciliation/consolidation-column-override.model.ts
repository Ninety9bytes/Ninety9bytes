import { DataTargetName } from '../../_enums/data-target-name';

export interface ConsolidationColumnOverride {
  id?: string;
  consolidationColumnId: string;
  matchCodeId: string;
  source: DataTargetName;
  columnName: string;
}
