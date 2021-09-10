import { DataTargetName } from '../_enums/data-target-name';
import { Asset } from './asset.model';

export interface MatchSelectionEvent {
  dataSource: DataTargetName;
  asset: Asset;
}
