import { Asset } from '../../../_models/asset.model';

export interface AssetTransferRequestDto {
  type: string;
  cost: number;
  quantity: number;
  account: string;
  department: string;
  property: string;
  building: string;
  floor: string;
  room: string;
  assetsToTransfer: Array<Asset>;
}