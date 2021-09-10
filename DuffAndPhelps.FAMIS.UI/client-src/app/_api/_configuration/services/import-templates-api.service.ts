import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { ImportTemplateDto } from '../dtos/import-template.dto';
import { Observable } from 'rxjs';

@Injectable()
export class ImportTemplatesApiService {
  private configEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  // TODO: Implement ot copy-over remaining service methods

  // GET /api/ImportTemplates/{id} // TODO Fix Any Type
  public getImportTemplatesById(id: string): Observable<ImportTemplateDto> {
    return this.apiService.get(`${this.configEndpoint}/ImportTemplates/${id}`, null, true);
  }

  // GET /api/ImportTemplates/CustomColumns/DataTypes
  // GET /api/ImportTemplates
}