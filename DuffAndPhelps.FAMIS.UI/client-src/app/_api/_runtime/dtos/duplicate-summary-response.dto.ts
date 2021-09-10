import { AssetDto } from './asset.dto';
import { AssetSearchDto } from './asset-search.dto';

export interface DuplicateSummaryResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    assets: AssetDto[];
    searchFilter: AssetSearchDto;
  }