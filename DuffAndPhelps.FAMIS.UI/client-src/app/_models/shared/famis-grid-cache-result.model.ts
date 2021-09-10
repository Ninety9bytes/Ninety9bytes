import { AssetFilterTermDto } from '../../_api/_runtime/dtos/asset-filter-term.dto';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';

export interface FamisGridCacheResult {
  gridId: number;
  cachedData: Array<any>;
  updateCache: boolean;
  filters?: Array<AssetFilterTermDto>;
  sortTerms?: Array<AssetSortTermDto>;
  cacheWindow?: FamisGridCacheWindow;
}

export interface FamisGridCacheWindow {
  skip: number;
  take: number;
}

