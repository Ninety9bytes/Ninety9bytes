import {map} from 'rxjs/operators';
import { GroupDto } from '../dtos/group.dto';
import { ApiService } from '../../services/api.service';
import { GroupSearchResultDto } from '../dtos/group-search-result.dto';
import { ContractGroupDto } from '../dtos/contract-group.dto';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { ContractGroupsTemplateDto } from '../dtos/contract-groups-template.dto';
import { GroupTemplateDto } from '../dtos/group-template.dto';
import { GroupTemplateRequestDto } from '../dtos/group-template-request.dto';
import { CopyGroupsDto } from '../dtos/copy-groups.dto';
import { GroupSave } from '../../../_models/group-save.model';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';

@Injectable()
export class GroupApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private apiService: ApiService) {}

  // GET /api/group/{id}/ContractGroup
 public getContractGroup(id: string, includePortal: boolean): Observable<ContractGroupDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}/ContractGroup?isPortal=${includePortal}`);
  }

  // GET /api/group
  getGroups(): Observable<GroupDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/group`);
  }

  // GET /api/group/{id}
  getGroup(id: string): Observable<GroupDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}`).pipe(map(res => res.result));
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

    return this.apiService.get(url);
  }

  // TODO: Implement ot copy-over remaining service methods
  // GET /api/group/RelatedToTemplates
  // GET /api/group/{id}/CostField
  // POST /api/group/{id}/CostField
  // GET /api/group/{id}/ContractGroups/InventoryFiles

  // GET /api/group/{id}/ContractGroupTemplate
  public getContractGroupTemplate(groupId: string): Observable<ContractGroupsTemplateDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${groupId}/ContractGroupTemplates`);
  }

  // POST /api/group
  public createGroup(request: GroupTemplateRequestDto): Observable<GroupTemplateDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/group/`, request, null, true);
  }

  // PATCH /api/group
  public updateGroup(request: GroupTemplateRequestDto): Observable<GroupTemplateDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/group/`, request);
  }

  // DELETE /api/group
  public deleteGroup(groupId: string): Observable<GroupTemplateDto> {
    return this.apiService.delete(`${this.runtimeEndpoint}/group/${groupId}`);
  }

  public copyGroups(request: CopyGroupsDto, localErrorHandling: boolean = false): Observable<string> {
    return this.apiService.post(`${this.runtimeEndpoint}/group/CopyGroups`, request, null, localErrorHandling);
  }

  public getGroupSavePoints(groupId: string): Observable<Array<GroupSave>> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${groupId}/RollbackMilestones`);
  }

  public setGroupSavePoint(groupId: string, description: string): Observable<ApiServiceResult<GroupSave>> {
    const url = `${this.runtimeEndpoint}/group/${groupId}/RollbackMilestones?description=${description}`;
    return this.apiService.post(url, null, null).pipe(map(results => results));
  }

  public restoreToSavePoint(request: GroupSave, localErrorHandling: boolean): Observable<string> {
    return this.apiService.post(`${this.runtimeEndpoint}/group/RollbackToSavePoint`, request, null, localErrorHandling);
  }
}
