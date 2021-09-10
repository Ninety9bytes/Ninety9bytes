import { AssetDto } from './asset.dto';
import { FutureYear } from './depreciation-future-year.dto';

export interface DepreciationSummaryReponse {
  numberInThisPayload: number;
  totalInRecordSet: number;
  isPreview: boolean;
  futureYears: FutureYear[];
  assets: AssetDto[];
}


