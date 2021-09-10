import { SearchRecordDto } from '../inventory/search-response.dto';

export interface MatchRecordsDto {

  inventoryRecords: SearchRecordDto[];
  clientFileRecords: SearchRecordDto[];
  detailRecordCount: number;
}