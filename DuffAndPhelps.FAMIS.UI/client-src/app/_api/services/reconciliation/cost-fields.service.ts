
import {map} from 'rxjs/operators';
import { ApiService } from '../api.service';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class CostFieldsService {
  configurationEndpoint: string;
  runtimeEndpoint: string;

  constructor(
    private configService: ConfigService,
    private apiService: ApiService,
    private http: HttpClient
  ) {
    this.configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');
    this.runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  }

  getGroupCostField(groupId: string): Observable<any> {
    const url = `${this.runtimeEndpoint}/group/${groupId}/CostField`;
    return this.apiService.get(url);
  }

  getTemplates(): Observable<any> {
    const url = `${this.configurationEndpoint}/ImportTemplates/FAMIS`;

    return this.apiService.get(url).pipe(map(results => results));
  }

  getCostFields(templateId: string): Observable<any> {
    const url = `${this
      .configurationEndpoint}/ImportTemplates/${templateId}`;

    return this.apiService.get(url).pipe(map(results => results));
  }

  saveCostField(groupId: string, assetFileField: string): Observable<any> {
    const url = `${this
      .runtimeEndpoint}/group/${groupId}/CostField?assetFileField=${assetFileField}`;

    return this.apiService.post(url, null, null).pipe(map(results => results));
  }
}
