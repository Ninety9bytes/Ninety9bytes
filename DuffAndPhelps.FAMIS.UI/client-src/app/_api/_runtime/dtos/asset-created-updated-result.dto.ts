import { Asset } from '../../../_models/asset.model';

export interface AsssetCreatedUpdatedResult {
  numberInThisPayload: number;
  totalInRecordSet: number;
  assets: Asset[];
}
