import { ReconciliationMatchDto } from './reconcilation-match.dto';
import { ReconcilationMassMatchDto } from './reconcilation-mass-match.dto';

export interface ReconciliationMassMatchResult {
  code: number;
  result: ReconciliationMatchDto[];
  invalidArguments: ReconcilationMassMatchDto[]
}
