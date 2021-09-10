
import {map} from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { TemplateDto } from '../dtos/template.dto';
import { TemplateBaseDto } from '../dtos/template-base.dto';

@Injectable()
export class TemplatesApiService {
  private configEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  // GET /api/Templates/Group/{groupId}
  public getTemplateById(templateId: string):Observable<TemplateDto> {
    return this.apiService.get(`${this.configEndpoint}/Templates/${templateId}`);
  }

  // DELETE /api/Templates/{templateId}

  // GET /api/Templates/{templateId}
  public GetTemplateForGroup(groupId: string):Observable<TemplateBaseDto> {
    return this.apiService.get(`${this.configEndpoint}/Templates/Group/${groupId}`);
  }

  //TODO: Implement ot copy-over remaining service methods
  
  // GET /api/Templates/MasterTemplates
  // POST /api/Templates/Group
  // PATCH /api/Templates/{templateId}/retire

  // GET /api/Templates/search
  public searchTemplate(query: string):Observable<TemplateDto[]> {
    if (query === '') {
      return of([]);
    }

    return this.apiService.get(`${this.configEndpoint}/Templates/search?query=${query}`).pipe(
      map(response => <TemplateDto[]>response));
  }

  // GET /api/Templates
  // POST /api/Templates
  // PUT /api/Templates
}
