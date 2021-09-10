import { ReconciliationMatchDto } from '../_api/dtos/reconcilation-match.dto';

export interface AcceptMatchSavedEvent {
  matchType: number;
  match: ReconciliationMatchDto;
}
