import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Injectable()
export class WorkflowsApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  //TODO: Implement ot copy-over remaining service methods

  // GET /api/Workflows/{id}
  // GET /api/Workflows/WorkflowTasks/{id}
  // DELETE /api/Workflows/WorkflowTasks
  // POST /api/Workflows/WorkflowTasks
  // PUT /api/Workflows/WorkflowTasks
  // DELETE /api/Workflows
  // GET /api/Workflows
  // POST /api/Workflows
  // PUT /api/Workflows
}
