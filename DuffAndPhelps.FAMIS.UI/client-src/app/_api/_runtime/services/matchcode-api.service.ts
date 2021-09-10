import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Injectable()
export class MatchCodeApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

// TODO: Implement ot copy-over remaining service methods

// GET /api/MatchCodes/Group/{groupId}
// POST /api/MatchCodes/Group/{groupId}

}
