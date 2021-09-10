
export interface ContractSummary {
  id: string;
  client: string;
  opportunityName: string;
  office?: string;
  country?: string;
  industry?: string;
  projectCode?: string;
  service?: string;
  billingDirector?: string;
  performingMd?: string;
  groupIds?: Array<string>;
  primaryGroupId?: string;
}
