import { AssetDto } from './reconciliation-summary-result.dto';


export interface MatchOrAllocationResult {
  groupId: string;
  assetIds: string[];
  assetData: AssetDto[];
}