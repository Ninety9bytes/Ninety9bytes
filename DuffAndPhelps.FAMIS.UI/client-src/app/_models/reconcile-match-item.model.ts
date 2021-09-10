import { Asset } from './asset.model';

export interface ReconcileMatchItem {
    assetId: string;
    asset: Asset;
    dataSource: number;
    matchCodeId: string;
}
