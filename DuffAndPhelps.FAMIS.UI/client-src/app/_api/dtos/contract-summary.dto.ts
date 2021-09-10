export interface ContractSummaryDto {
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
  reconciliationProgress: string;
  createdFromSalesforce?: any;
}
