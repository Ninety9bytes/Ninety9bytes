import { AssetDto } from './asset.dto';
import { AssetsInError } from './assets-in-error.dto';
import { FutureYear } from './depreciation-future-year.dto';

export interface ProcessingDetailResponseDto {
  numberInThisPayload: number;
  totalInRecordSet: number;
  isPreview: boolean;
  assets: AssetDto[];
  futureYears: FutureYear[];
  assetsInError: Array<AssetsInError>;
}
