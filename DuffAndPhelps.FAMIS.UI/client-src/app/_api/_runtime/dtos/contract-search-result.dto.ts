import { GroupSummaryDto } from '../../dtos/group-summary.dto';

export interface ContractSearchResultDto {
    id: string;
    projectCode: string;
    contractName: string;
    groups: GroupSummaryDto[];
  }