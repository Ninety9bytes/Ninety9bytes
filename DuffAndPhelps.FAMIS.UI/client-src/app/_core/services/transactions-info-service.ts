import { Injectable } from '@angular/core';

@Injectable()
export class TransactionsInfoService {
  private hiddenColumns = ['transactionId'];

  private defaultColumns = [
    'displayId',
    'assetTagNumber',
    'activity',
    'fieldName',
    'oldValue',
    'newValue',
    'transactionDate',
    'user',
  ];

  public GetInternalColumns(): Array<string> {
    return this.hiddenColumns;
  }

  public GetDefaultColumns(): Array<string> {
    return this.defaultColumns;
  }

}
