import { TrendingSummaryDto } from './trending-summary.dto';

export interface TrendingDto {
  id: string;
  name: string;
  byYear: boolean;
  indices: TrendingSummaryDto[];
}
