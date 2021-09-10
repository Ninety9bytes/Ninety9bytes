export interface Transaction {
  transactionId: string;
  assetId?: string;
  assetTagNumber?: string;
  activity: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  transactionDate: string;
  displayId: number;
  description: string;
  user: string;
  editedBy?: string;
}
