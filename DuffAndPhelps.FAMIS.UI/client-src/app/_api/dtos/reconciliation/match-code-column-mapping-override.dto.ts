import { DataTargetName } from '../../../_enums/data-target-name';

export interface MatchCodeColumnMappingOverrideDto {
  id?: string;
  matchCodeId: string;
  source: DataTargetName;
  name: string;
}
