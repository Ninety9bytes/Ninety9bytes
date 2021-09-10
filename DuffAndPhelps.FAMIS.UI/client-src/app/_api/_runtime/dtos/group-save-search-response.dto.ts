import { GroupSave } from '../../../_models/group-save.model';

export interface GroupSaveSearchResponseDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  savePoints: GroupSave[];
}

