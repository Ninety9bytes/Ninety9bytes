import { DataTargetName } from '../../../_enums/data-target-name';
import { MatchCodeColumnMappingOverrideDto } from './match-code-column-mapping-override.dto';

export interface MatchCodeColumnMapDto {
  id?: string;
  source: DataTargetName;
  name: string;
  displayName: string;
  destinationColumnName: string;
  order: number;
  matchCodeOverrides: Array<MatchCodeColumnMappingOverrideDto>;
}
