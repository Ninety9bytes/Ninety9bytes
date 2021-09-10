import { ModuleDto } from '../dtos/module.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';

@Injectable()
export class ModulesApiService {
  private apiEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  // TODO: Implement ot copy-over remaining service methods

  // GET /api/Modules/{moduleId}
  // GET /api/Modules
  getAll(): Observable<Array<ModuleDto>> {
    return this.apiService.get(`${this.apiEndpoint}/Modules`);
  }
}
