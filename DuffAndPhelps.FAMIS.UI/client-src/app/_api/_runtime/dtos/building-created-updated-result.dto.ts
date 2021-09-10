import { BuildingDto } from './building.dto';

export interface BuildingCreatedUpdatedResult {
  numberInThisPayload: number;
  totalInRecordSet: number;
  buildings: BuildingDto[];
}
