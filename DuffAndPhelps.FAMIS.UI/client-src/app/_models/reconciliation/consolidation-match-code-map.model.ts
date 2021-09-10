import { MatchCode } from '../match-code.model';
import { ConsolidationColumn } from './consolidation-column.model';

export interface ConsolidationMatchCodeMap {
    matchCode: MatchCode;
    column: ConsolidationColumn;
}
