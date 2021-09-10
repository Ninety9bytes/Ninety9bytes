import { ClientFileDto } from '../dtos/fileUpload/clientFileDto';
import { ApiService } from '../../services/api.service';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetSortTermDto, AssetFilterTermDto } from '../../dtos/inventory/asset-search.dto';
import { BuildingSearchDto } from '../dtos/building-search.dto';

@Injectable()
export class ClientFileApiService {
  public defaultSortTerms = [
    <AssetSortTermDto>{
      termOrder: 0,
      sortDirection: 1,
      field: ''
    }
  ];

  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public getGroupUplodFiles(id: string): Observable<ClientFileDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/ClientFiles/Group/${id}`);
  }

  public searchGroupUplodFiles(id: string, searchRequest: BuildingSearchDto): Observable<ClientFileDto[]> {
    return this.apiService.post(`${this.runtimeEndpoint}/ClientFiles/Group/${id}/Search`, searchRequest);
  }

  public getGroupFinalizedDocuments(id: string): Observable<ClientFileDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/ClientFiles/FinalizedDocuments/Group/${id}`);
  }

  public getGroupMemberUploadFiles(id: string, memberId: string): Observable<ClientFileDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/ClientFiles/Group/${id}/Member/${memberId}`);
  }

  public getClientFile(id: string): Observable<string> {
    return this.apiService.get(`${this.runtimeEndpoint}/ClientFiles/${id}`);
  }

  public uploadGroupFile(groupId: string, file: File, isInternal: boolean, memberId?: string, userId?: string):
  Observable<ClientFileDto> {
    let url = `${this.runtimeEndpoint}/ClientFiles/Group/${groupId}`;
    if (memberId) {
      url += `/Member/${memberId}`;
    }
    url += `?fileName=${file.name}&isFinalized=true&isInternal=${isInternal}`;
    if (userId) {
      url += `&userId=${userId}`;
    }
    return this.apiService.post(url, null, file);
  }

  public deleteFile(id: string): Observable<boolean> {
    // This is because the API is not returning a boolean, it has an empty body which is breaking the API service.
    // TODO update API to return a boolean in the message body.
    return this.apiService.delete(`${this.runtimeEndpoint}/ClientFiles/${id}`);
  }

  public updateGridData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<
      AssetSortTermDto
    >(),
    filterTerms: Array<AssetFilterTermDto> = new Array<
      AssetFilterTermDto
    >()
  ): Observable<ClientFileDto[]> {
    const defaultFilter = [];

    const searchRequest = <BuildingSearchDto>{
      filterTerms:
        !!filterTerms && filterTerms.length > 0 ? filterTerms : defaultFilter,
      filterConjunction: 'and',
      excludeMatchedRecords: false,
      sortTerms:
        !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultSortTerms,
      skip: skip,
      take: take
    };

    return this.searchGroupUplodFiles(groupId, searchRequest);
  }
}
