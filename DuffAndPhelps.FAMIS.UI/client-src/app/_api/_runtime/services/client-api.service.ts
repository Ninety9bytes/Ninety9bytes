import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { ApiService } from '../../services/api.service';
import { ClientDto } from '../dtos/client.dto';
import { Observable } from 'rxjs';
import { ClientHierarchyDto } from '../dtos/client-hierarchy.dto';

@Injectable()
export class ClientApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private apiService: ApiService) {}

  // GET /api/client
  getClients(): Observable<ClientDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/client`);
  }

  // GET /api/client/{clientId}/hierarchy
  getHierarchyByClient(clientId: string): Observable<ClientHierarchyDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/client/${clientId}/hierarchy`);
  }

}
