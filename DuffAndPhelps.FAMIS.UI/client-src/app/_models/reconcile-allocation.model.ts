import { Asset } from './asset.model';

export interface ReconcileDataAllocations {
    allocationClientAsset?: Asset;
    allocationInventoryAssets?: Array<Asset>;
    allocationTotal?: number;
    isNewAllocation: boolean;
    isValidAllocation: boolean;
    parentAssetFileRecordId: string;
    matchId: string;
}
