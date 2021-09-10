import { RecipientsApiService } from '../../_api/_runtime/services/recipients-api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RecipientDto } from '../../_api/_runtime/dtos/recipient.dto';

@Injectable()
export class RecipientsService {

  groupId: string;


  constructor(
    private recipientsApiService: RecipientsApiService
  ) { }

  public updateRecipientsData(
    groupdId: string,
    skip: number,
    take: number,
  ): Observable<RecipientDto[]> {

    return this.getRecipientsByGroupId(groupdId);
  }

  getRecipientsByGroupId(groupId: string): Observable<Array<RecipientDto>> {
    return this.recipientsApiService.getRecipientsByGroupId(groupId);
  }

  createRecipient(groupId: string, dto: RecipientDto): Observable<Array<RecipientDto>> {
    return this.recipientsApiService.createRecipient(groupId, dto);
  }

  updateRecipient(recipientId: string, groupId: string,
    recipientDto: RecipientDto): Observable<Array<RecipientDto>> {

    return this.recipientsApiService.updateRecipient(recipientId, groupId, recipientDto);
  }

  deleteRecipient(recipientId: string): Observable<Array<RecipientDto>> {
    return this.recipientsApiService.deleteRecipient(recipientId);
  }
}
