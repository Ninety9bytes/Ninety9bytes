import { ApiService } from '../../services/api.service';
import { ConfigService } from '@ngx-config/core';
import { Injectable } from '@angular/core';
import { RecipientDto } from '../dtos/recipient.dto';
import { Observable } from 'rxjs';

@Injectable()
export class RecipientsApiService {

  private runtimeEndpoint = this.configService.getSettings(
    'runtimeApiEndpoint'
  );

  constructor(
    private configService: ConfigService,
    private apiService: ApiService
  ) {}

  // GET /api/recipient/group/{groupId}
  public getRecipientsByGroupId(groupId: string): Observable<Array<RecipientDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/recipient/group/${groupId}`);
  }

  // POST /api/recipient/group/{groupId}
  public createRecipient(groupId: string, dto: RecipientDto): Observable<Array<RecipientDto>> {
    return this.apiService.post(`${this.runtimeEndpoint}/recipient/group/${groupId}`, dto);
  }

  // PUT /api/recipient/{recipientId}/group/{groupId}
  public updateRecipient(recipientId: string, groupId: string,
    dto: RecipientDto): Observable<Array<RecipientDto>> {

    return this.apiService.put(`${this.runtimeEndpoint}/recipient/${recipientId}/group/${groupId}`, dto);
  }

  // DELETE /api/recipient/{recipientId}
  public deleteRecipient(recipientId: string): Observable<Array<RecipientDto>> {
    return this.apiService.delete(`${this.runtimeEndpoint}/recipient/${recipientId}`);
  }

}
