import { CreateAssetFileCustomColumnDto } from '../_api/dtos/create-asset-file-custom-column.dto';

export interface ColumnAddedEvent {
  dataSource: number;
  columns: CreateAssetFileCustomColumnDto[];
}

