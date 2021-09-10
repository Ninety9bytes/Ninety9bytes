import { ReconcileMatchItem } from './reconcile-match-item.model';

export interface SelectedMatchEvent {
  matchType: number;
  matches: ReconcileMatchItem[];
}
