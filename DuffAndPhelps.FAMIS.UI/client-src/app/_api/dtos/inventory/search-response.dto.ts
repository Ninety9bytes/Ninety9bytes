import { ReconcilationMassMatchDto } from '../reconcilation-mass-match.dto';
import { ManyToOneMatchDto } from '../reconciliation/many-to-one-match.dto';
import { OneToManyMatchDto } from '../reconciliation/one-to-many-match.dto';
import { SearchRequestDto } from './search-request.dto';

export interface SearchResponseDto {
  matches: ReconcilationMassMatchDto[];
  searchFilter: SearchRequestDto;
  records: SearchRecordDto[];
  manyToManyMatches: number;
  matches_ManyToOne: ManyToOneMatchDto[];
  matches_OneToMany: OneToManyMatchDto[];

}
export interface SearchRecordDto {
  id: string;
  assetTagNumber: string;
  oldTagNumber: string;
  activityCode: string;
  property?: string;
  building: string;
  floor: string;
  room: string;
  locationInPlant: string;
  department: string;
  classCode: string;
  assetClass?: string;
  gLAssetAccount: string;
  gLAccumAccount: string;
  fundingSource: string;
  quantity: number;
  description: string;
  description2: string;
  description3: string;
  manufacturer: string;
  modelNumber: string;
  faceDescription: string;
  serialNumber: string;
  acquisitionDate: string;
  historicalCost: number;
  functionActivity: string;
  plant: string;
  city: string;
  purchaseOrder: string;
  invoiceNumber: string;
  vendor: string;
  propertyType: string;
  projectNumber: string;
  businessUnit: string;
  lastInventoryDate: string;
  account?: string;
  insuranceAccount?: string;
  accountClass?: string;
  division?: string;
  gLAccount?: string;
  costReplacementNew?: number;
  netProceeds?:number;
  salvageValue?: number;
  fundContribution?: number;
  disposalCode?: string;
  disposalDate?: Date;
  sourceCode?: string;
  updatedTimeStamp: Date;
  isUnmatched?:boolean;
}

/*export interface SearchMatchDto {
  primaryAssetRecordId: string;
  secondaryAssetRecordId: string;
  isOneToOne: boolean;
  matchCodeId: string;
}*/
