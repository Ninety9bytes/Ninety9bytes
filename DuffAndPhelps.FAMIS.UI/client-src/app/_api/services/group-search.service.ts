
import {map, tap} from 'rxjs/operators';

import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { Group } from '../../_models/group';
import { ContractGroupDto } from '../_runtime/dtos/contract-group.dto';
import { GroupSearchResultDto } from '../_runtime/dtos/group-search-result.dto';

@Injectable()
export class GroupSearchService {

  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(
      private configService: ConfigService,
      private http: HttpClient,
      private apiService: ApiService
    ) {
  }

  getGroup(id: string): Observable<Group> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}`);
  }

  getGroups(): Observable<Group[]> {
    const groupGetAllUrl = this.runtimeEndpoint + '/group';
    return this.http.get(groupGetAllUrl).pipe(tap(console.log)).pipe(map(response => <Group[]>response.json));
  }

  public getContractGroup(id: string): Observable<ContractGroupDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}/ContractGroup`).pipe(map(response => <ContractGroupDto>response));
  }

  searchGroups(query: string, includeContractSearch: boolean): Observable<GroupSearchResultDto[]> {

    if (query === '') {
      return of([]);
    }

    let path = `${this.runtimeEndpoint}/group/search`;
    if (includeContractSearch) {
      path += `/contract`;
    }
    const url = path + `?query=${query}`;

    return this.apiService.get(url).pipe(
    map(response => <GroupSearchResultDto[]>response));
  }
}
