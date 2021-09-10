import { DataTargetName } from '../../_enums/data-target-name';

export interface ConsolidationAssignment {
  id: string;
  columnName: string;
  displayName: string;
  source: DataTargetName;
  order: number;
  isCustom: boolean;
}
