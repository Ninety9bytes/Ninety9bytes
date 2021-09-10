import { Asset } from '../../../_models/asset.model';

export interface AssetRetirementRequestDto {
  type: string;
  cost: number;
  quantity: number;
  disposalCode: string;
  disposalDate: Date;
  assetsToRetire: Array<Asset>;
}