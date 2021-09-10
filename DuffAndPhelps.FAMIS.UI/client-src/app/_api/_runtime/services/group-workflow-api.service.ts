import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Injectable()
export class GroupWorkflowApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  // TODO: Implement ot copy-over remaining service methods


//  GET /api/Workflows/{id}
//  GET /api/Workflows/group/{id}
//  GET /api/Workflows/History/{id}
//  PUT /api/Workflows/Task/Assign
//  PUT /api/Workflows/Task/SetExecute
//  PUT /api/Workflows/Task/{id}/Toggle
//  GET /api/GroupWorkflow

}
