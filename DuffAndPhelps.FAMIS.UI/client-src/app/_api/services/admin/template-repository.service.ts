
import {map} from 'rxjs/operators';
import { ApiService } from '../api.service';
import { CountryDto } from '../../dtos/country.dto';

import { TemplateBaseDto } from '../../dtos/template-management/template-base.dto';
import { SetTemplateIsRetiredDto } from '../../dtos/template-management/set-template-isretired.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';


@Injectable()
export class TemplateRepositoryService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  getAll(): Observable<Array<TemplateBaseDto>> {
    return this.apiService.get(`${this.configurationEndpoint}/templates`);
  }

  get(id: string): Observable<any> {
    return this.apiService.get(`${this.configurationEndpoint}/templates/${id}`);
  }

  delete(id: string): Observable<any> {
    return this.apiService.delete(`${this.configurationEndpoint}/templates/${id}`);
  }

  create(template): Observable<TemplateBaseDto> {
    return this.apiService.post(`${this.configurationEndpoint}/Templates`, template).pipe(map(data => data));
  }

  update(template): Observable<TemplateBaseDto> {
    return this.apiService.put(`${this.configurationEndpoint}/Templates`, template).pipe(map(data => data));
  }

  retire(templateId: string, isRetired: string): Observable<SetTemplateIsRetiredDto> {
    // TODO: This isn't the correct path, nor payload. Validate when the method exists.
    return this.apiService.patch(`${this.configurationEndpoint}/Templates/${templateId}/retire?isRetired=${isRetired}`);
  }
}
