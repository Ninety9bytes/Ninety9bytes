import { ConsolidatedFileColumnMapDto } from '../../dtos/consolidated-file-column-map.dto';

export interface ConsolidatedFilePreviewDto {
    matchCodeId: string;
    matchCodeName: string;
    recordCount: number;
    columnProperties: ConsolidatedFileColumnMapDto[];
    assetRecords: Object[];
  }
