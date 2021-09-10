import { Asset } from '../../../_models/asset.model';

export interface CostAdjustmentRequestDto {
  prorate: number;
  currentHistorialCost: number;
  adjustmentCost: string;
  newHistorialCost: string;
  currentAccumulatedDepreciation: number;
  adjustmentAccumulatedDepreciation: string;
  newAccumulatedDepreciation: string;
  asset: Asset;
}
