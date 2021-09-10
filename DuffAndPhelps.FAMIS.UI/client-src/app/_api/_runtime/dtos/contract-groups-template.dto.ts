import { GroupTemplateDto } from './group-template.dto';

export interface ContractGroupsTemplateDto {
  contractName: string;
  contractId: string;
  contractGroupTemplateInfo: Array<GroupTemplateDto>;
}