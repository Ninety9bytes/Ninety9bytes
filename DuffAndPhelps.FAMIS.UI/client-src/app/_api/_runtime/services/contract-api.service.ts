import { ContractGroupSummaryDto } from '../dtos/contract-group-summary.dto';
import { ContractGroupDto } from '../../dtos/contract-group.dto';
import { ContractSummaryDto } from '../../dtos/contract-summary.dto';
import { ContractSearchResultDto } from '../dtos/contract-search-result.dto';
import { ContractSearchDto, ContractGridSearchResultsDto } from '../dtos/contract/contract-search-filter-dto';
import { IndexModelMetadata } from '../dtos/field-meta-data.dto';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '@ngx-config/core';
import { ApiService } from '../../services/api.service';

@Injectable()
export class ContractApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public getContractGroup(id: string): Observable<ContractGroupDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}/ContractGroup`);
  }

  // TODO: Implement ot copy-over remaining service methods

  // GET /api/contract
  // GET /api/contract/{id}
  // GET /api/contract/{contractId}/Groups
  public getContractsGroups(id: string, includePortals = false): Observable<ContractGroupSummaryDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/contract/${id}/groups?includePortals=${includePortals}`);
  }
  // GET /api/contract/{contractId}/Groups/{groupId}

  public getContracts(includePortal: boolean): Observable<ContractSummaryDto[]>{
    return this.apiService.get(`${this.runtimeEndpoint}/contract?isPortal=${includePortal}`);
  }

  public searchContracts(query: string, excludePortals = false): Observable<ContractSearchResultDto[]> {
    if (query === '') {
      return of([]);
    }
    return this.apiService.get(`${this.runtimeEndpoint}/contract/search?query=${query}&excludePortals=${excludePortals}`);
  }

  public getContractMetadata(): Observable<IndexModelMetadata> {
    return this.apiService.get(`${this.runtimeEndpoint}/contract/Search/metadata`);
  }

  public searchContractGrid(searchDto: ContractSearchDto): Observable<ContractGridSearchResultsDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/contract/Search`, searchDto);
  }
  public logGroupandCheckOtherUser(id: string): Observable<boolean> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${id}/ActivityLog`);
  }
}
