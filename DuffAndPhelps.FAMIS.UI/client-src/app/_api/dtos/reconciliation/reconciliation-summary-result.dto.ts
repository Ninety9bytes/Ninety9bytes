import { ReconciliationAllocationDto } from '../reconcilation-allocation.dto';

export interface ReconciliationSummaryResult {
  groupId: string;
  assetIds: string[];
  assetData: AssetDto[];
  allocations?: ReconciliationAllocationDto[],
  matchId:string;
  matchCodeId:string;
  matchCodeName: string;
  assetFileRecordId:string;
}

export interface AssetDto {
  id: string;
  updatedTimeStamp: Date;
  matchId: string;
  matchCodeId: string;
  matchCodeName: string;
  parentId: string;
  isParent: boolean;
  oldTagNumber: string;
  description: string;
  assetTagNumber: string;
  dataSource:number;
  historicalCost?:number;
  sourceCode?:string;
  allocationId?:string;
  serialNumber?:string;
  modelNumber?:string;
  floor?:string;
  quantity?:number;
  buildingName?:string;
}
