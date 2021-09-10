import { Injectable } from '@angular/core';

@Injectable()
export class RecipientsInfoService {
  private hiddenColumns = [
    'id'
  ];

  private defaultColumns = [
    'recipientName',
    'address',
    'address2',
    'city',
    'state',
    'zip',
    'email',
    'phoneNumber',
    'deliverables',
  ];

  public GetInternalColumns(): Array<string> {
    return this.hiddenColumns;
  }

  public GetDefaultColumns(): Array<string> {
    return this.defaultColumns;
  }

}
