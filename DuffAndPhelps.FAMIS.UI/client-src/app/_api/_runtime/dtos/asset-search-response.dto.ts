import { AssetSearchDataDto } from './asset-search-data.dto';
import { AssetSearchDto } from './asset-search.dto';

export interface AssetSearchResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    assets: AssetSearchDataDto[];
    searchFilter: AssetSearchDto;
  }
