import { CreateAssetFileCustomColumnDto } from '../../_api/dtos/create-asset-file-custom-column.dto';
import { GridColumnHeader } from '../grid-column-header.model';

export interface FamisGridUpdateColumnSelectionEvent {
  PendingCustomColumns: Array<CreateAssetFileCustomColumnDto>;
  SelectedHeaders: Array<string>;
  RemoveCustomColumns: Array<GridColumnHeader>;
}
