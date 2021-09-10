import { ReconciliationMatchSummaryDto } from '../_api/dtos/reconcilation-match-summary.dto';

export interface ReconcileData {

  matchCodes?: Array<any>;
  clientFileData?: Array<any>;
  actualInventoryData?: Array<any>;
  matchedSummaryRecords?: Array<ReconciliationMatchSummaryDto>;
  matchedRecords?: Array<ReconciliationMatchSummaryDto>;
  clientFileHeaders?: Array<any>;
  actualInventoryHeaders?: Array<any>;

  selectedMatchCodeId?: string;
  selectedClientFileItems?: Array<any>;
  selectedInventoryItems?: Array<any>;
}
