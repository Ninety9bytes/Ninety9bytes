import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Injectable()
export class ReconciliationsApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

// TODO: Implement ot copy-over remaining service methods

// GET /api/Reconciliations/Group/{id}
// POST /api/Reconciliations/Group/{id}
// GET /api/Reconciliations/Group/{id}/Summary
// POST /api/Reconciliations/Group/{id}/Summary
// GET /api/Reconciliations/Group/{id}/Validate
// POST /api/Reconciliations/Match/Single
// POST /api/Reconciliations/Match/MassMatch
// PATCH /api/Reconciliations/Match/{matchId}/MatchCode/{matchCodeId}
// PATCH /api/Reconciliations/Match/ParentChild
// POST /api/Reconciliations/Match/ParentChild
// PATCH /api/Reconciliations/Match/Allocation
// POST /api/Reconciliations/Match/Allocation
// DELETE /api/Reconciliations/Match/Remove/{id}

}
