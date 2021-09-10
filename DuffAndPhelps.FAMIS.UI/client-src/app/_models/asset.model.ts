import { ImageDto } from '../_api/_runtime/dtos/image.dto';
import { ReconcileMatchItem } from './reconcile-match-item.model';

export interface Asset {
  assetId: string;
  parentId: string;
  assetTagNumber: string;
  oldTagNumber: string;
  description: string;
  serialNumber: string;
  historicalCost: number;
  isMatched: boolean;
  isParent: boolean;
  isChild: boolean;
  parentChildMatches: Array<Asset>;
  matchType: number;
  dataSource: number;
  matches: Array<ReconcileMatchItem>;
  allocatedValue?: number;
  allocationId?: string;
  matchId?: string;
  matchCodeId?: string;
  matchCodeName?: string;
  quantity: number;
  isEdited?: boolean;
  assetImages?: ImageDto[];
  imageCollection?: ImageDto[];
  id: string;
  modelNumber: string;
  manufacturer: string;
  buildingName: string;
  floor: string;
}
