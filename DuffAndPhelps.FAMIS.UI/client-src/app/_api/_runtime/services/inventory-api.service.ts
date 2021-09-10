import {map} from 'rxjs/operators';
import { AssetSearchDto } from '../dtos/asset-search.dto';
import { AssetSearchResponseDto } from '../dtos/asset-search-response.dto';
import { ConsolidatedFilePreviewDto } from '../dtos/consolidated-file-preview.dto';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { ApiService } from '../../services/api.service';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetFileSummaryDto } from '../dtos/asset-file-summary.dto';
import { AssetDto } from '../dtos/asset.dto';
import { AccountDto, AccountResponseDto } from '../dtos/account.dto';
import { DepartmentDto, DepartmentResponseDto } from '../dtos/department.dto';
import { BuildingSearchDto } from '../dtos/building-search.dto';

@Injectable()
export class InventoryApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  // GET /api/Inventory/{groupId}/SearchMetadata/{dataTarget}
  public getSearchMetadataByGroupId(groupId: string, filetype: number): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${groupId}/SearchMetadata/${filetype}`, null, true);
  }

  public search(groupId: string, searchFilter: AssetSearchDto, file: File = null, localErrorHandling: boolean = true): Observable<AssetSearchResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets`, searchFilter, file, localErrorHandling);
  }

  // GET /api/Inventory/ConsolidatedFile/Preview/Group/{groupId}
  public getConsolidatedFilePreview(groupId: string): Observable<ApiServiceResult<Array<ConsolidatedFilePreviewDto>>> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Preview/Group/${groupId}`).pipe(
      map(result => <ApiServiceResult<Array<ConsolidatedFilePreviewDto>>>result));
  }

  public getAssetRecord(id: string): Observable<AssetDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${id}`);
  }

  public updateAssetRecord(recordId: string, recordDto: Object): Observable<AssetDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/${recordId}`, recordDto);
  }


  // TODO: Implement ot copy-over remaining service methods

  // POST /api/Inventory/AssetFiles/Upload
  // POST /api/Inventory/AssetFiles/Preview
  // PATCH /api/Inventory/AssetFiles/Complete
  // POST /api/Inventory/AssetFiles/{assetFile//Id}/CreateAssetRecord
  // DELETE /api/Inventory/AssetFiles/{assetFi//leId}
  // DELETE /api/Inventory/{groupId}/Assets/{dataTarget}
  // GET /api/Inventory/{groupId}/Assets/{dataTarget}
  // PATCH /api/Inventory/{assetRecordId}
  // POST /api/Inventory/{groupId}/Assets/MassMatch
  // POST /api/Inventory/{groupId}/Assets*///////
  // GET /api/Inventory/SearchMetadata/{dataTarget////}
  // PATCH /api/Inventory/{sourceGroupId}/CopyGroupInventory/{targetGroupId}
  // POST /api/Inventory/AssetFiles/{assetFileId}/CustomColumns
  // GET /api///Inventory/ConsolidatedFile/Group/{groupId}/Mapping
  // PATCH ///api/Inventory/ConsolidatedFile/Group/{groupId}/Mapping
  // GET /api/Inventory/ConsolidatedFile/Group/{groupId}/MatchCodeColumnMap
  // POST /api/Inventory/ConsolidatedFile/Group/{groupId}/MatchCodeColumnMap
  // GET /api/Inventory/ConsolidatedFile/Preview/Group/{groupId}
  // PATCH /api/Inventory/ConsolidatedFile/Create/{groupId}

  // GET /api/Inventory/group/{groupId}/Accounts
  public getAccountsByGroupId(groupId: string): Observable<Array<AccountDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/group/${groupId}/Accounts`, null, true);
  }

  // POST /api/Inventory/group/{groupId}/Account
  public createAccountByGroupId(groupId: string, request: AccountDto): Observable<AccountDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/group/${groupId}/Account`, request);
  }

  // DELETE /api/Inventory/Account/{accountId}
  public deleteAccountByAccountId(accountId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/Inventory/Account/${accountId}`, handleLocalError);
  }

  // PATCH /api/Inventory/Account/{accountId}
  public updateAccountByAccountId(request: AccountDto): Observable<AccountDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/Account/${request.id}`, request);
  }

  // GET /api/Inventory/group/{groupId}/Departments
  public getDepartmentsByGroupId(groupId: string): Observable<Array<DepartmentDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/group/${groupId}/Departments`, null, true);
  }

  // POST /api/Inventory/group/{groupId}/Department
  public createDepartmentByGroupId(groupId: string, request: DepartmentDto): Observable<DepartmentDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/group/${groupId}/Department`, request);
  }

  // DELETE /api/Inventory/Department/{departmentId}
  public deleteDepartmentByDepartmentId(departmentId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/Inventory/Department/${departmentId}`, handleLocalError);
  }

  // PATCH /api/Inventory/Department/{departmentId}
  public updateDepartmentByDepartmentId(request: DepartmentDto): Observable<DepartmentDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/Department/${request.id}`, request);
  }

  // GET /api/Inventory/{groupId}/Assets/{dataTarget}/count
  public getAssetCountByGroup(groupId: string, dataTarget: number, handleLocalError: boolean = false): Observable<number> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets/${dataTarget}/count`, null, handleLocalError);
  }
  
   // GET /api/Inventory/Accounts/SearchMetadata
   public getAccountSearchMetadata(): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/Accounts/SearchMetadata`);
  }

  // POST /api/Inventory/groups/{groupId}/accounts
  public searchAccountByGroup(groupId: string, searchFilter: BuildingSearchDto): Observable<AccountResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/groups/${groupId}/accounts`, searchFilter);
  }
   // GET /api/Inventory/Accounts/SearchMetadata
   public getDepartmentSearchMetadata(): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/Departments/SearchMetadata`);
  }

  // POST /api/Inventory/groups/{groupId}/accounts
  public searchDepartmentByGroup(groupId: string, searchFilter: BuildingSearchDto): Observable<DepartmentResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/groups/${groupId}/Departments`, searchFilter);
  }

  // GET /api/Inventory/{groupId}/Assets/{importTemplateId}/count
  public getDataCountByGroup(groupId: string, importTemplateId: string, handleLocalError: boolean = false): Observable<number> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${groupId}/Data/${importTemplateId}/count`, null, handleLocalError);
  }
// DELETE /api/Inventory/Account/{accountId}

public removeDeactivatedItems(groupId: string, type: number, datatarget: string): Observable<any> {
  const url = `${this.runtimeEndpoint}/Inventory/${groupId}/RemoveDeactivatedItems?type=${type}&datatarget=${datatarget}`;
  return this.apiService.delete(url, true);
}
}
