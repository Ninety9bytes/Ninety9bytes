import { ApiService } from '../../services/api.service';
import { BuildingDto, BuildingResponseDto, ValuationResponseDto } from '../dtos/building.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { BuildingSearchDto } from '../dtos/building-search.dto';
import { Observable } from 'rxjs';
import { AssetFileSummaryDto } from '../dtos/asset-file-summary.dto';
import { SiteDto, SiteResponseDto } from '../dtos/site.dto';
import { BuildingHierarchyDto } from '../dtos/building-hierarchy.dto';
import { MemberResponseDto, MemberDto } from '../dtos/member.dto';
import { TransactionResponseDto } from '../dtos/transaction-response.dto';
import { TransactionRequestDto } from '../dtos/transaction-request.dto';
import { RevertSummaryDto } from '../dtos/transaction-revert-summary.dto';
import { TransactionsDto } from '../dtos/transactions.dto';
import { TransactionsSearchFilter } from '../dtos/transactions-search-filter.dto';
import { GroupHierarchyDto } from '../dtos/client-hierarchy.dto';

@Injectable()
export class InsuranceApiService {
  private runtimeEndpoint = this.configService.getSettings(
    'runtimeApiEndpoint'
  );

  constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  // POST /api/insurance/groups/{groupId}/buildings
  public searchBuildingsByGroup(groupId: string,
    searchFilter: BuildingSearchDto): Observable<BuildingResponseDto> {

    return this.apiService.post(`${this.runtimeEndpoint}/insurance/groups/${groupId}/buildings`, searchFilter);
  }

  // POST /api/insurance/site/{siteId}/buildings
  public searchBuildingsBySite(siteId: string, searchFilter: BuildingSearchDto): Observable<BuildingResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/site/${siteId}/buildings`, searchFilter);
  }

  // POST /api/insurance/building/{groupId}/CreateBuilding
  public createBuilding(groupId: string,
    buildingDto: BuildingDto, handleLocalError: boolean): Observable<BuildingDto> {

    return this.apiService.post(`${this.runtimeEndpoint}/insurance/building/${groupId}/CreateBuilding`,
           buildingDto, null, handleLocalError);
  }

  // PATCH /api/insurance/building/{buildingId}
  public updateBuilding(id: string, buildingDto: BuildingDto,
     handleLocalError: boolean): Observable<BuildingDto> {

    return this.apiService.patch(`${this.runtimeEndpoint}/insurance/building/${id}`, buildingDto, handleLocalError);
  }

  // GET /api/insurance/{buildingId}
  public getBuilding(buildingId: string): Observable<BuildingDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/${buildingId}`);
  }

  // GET /api/insurance/{groupId}/SearchMetaData
  public getBuildingSearchMetadataByGroupId(groupId: string): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/${groupId}/SearchMetadata`);
  }

  // GET /api/insurance/SearchMetadata
  public getBuildingSearchMetadata(): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/SearchMetadata`);
  }

  // GET /api/insurance/group/{groupId}/sites
  public getSitesByGroup(groupId: string): Observable<Array<SiteDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/group/${groupId}/sites`);
  }

   // GET /api/insurance/group/{groupId}/sites
   public getBuildingHierarchyByGroupId(groupId: string): Observable<BuildingHierarchyDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/group/${groupId}/hierarchy`, null, true);
  }

  // GET /api/insurance/member/{memberId}/sites
  public getSitesByMember(memberId: string): Observable<Array<SiteDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/member/${memberId}/sites`);
  }

  // POST /api/insurance/group/{groupId}/site
  public createSiteByGroupId(groupId: string, request: SiteDto, handleLocalError: boolean): Observable<SiteDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/group/${groupId}/site`, request, null, handleLocalError);
  }

  // DELETE /api/insurance/site/{siteId}
  public deleteSiteBySiteId(siteId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/insurance/site/${siteId}`, handleLocalError);
  }

  // PATCH /api/insurance/site/{siteId}
  public updateSiteBySiteId(request: SiteDto, handleLocalError: boolean): Observable<SiteDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/insurance/site/${request.id}`, request, handleLocalError);
  }

  // GET /api/insurance/Members/SearchMetadata
  public getMembersSearchMetadata(): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/Members/SearchMetadata`);
  }

    // GET /api/insurance/Sites/SearchMetadata
  public getSiteSearchMetadata(): Observable<AssetFileSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/Sites/SearchMetadata`);
  }


  // POST /api/insurance/groups/{groupId}/members
  public searchMemberssByGroup(groupId: string, searchFilter: BuildingSearchDto): Observable<MemberResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/groups/${groupId}/members`, searchFilter);
  }

  // GET /api/insurance/group/{groupId}/members
  public getMembersByGroupId(groupId: string): Observable<Array<MemberDto>> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/group/${groupId}/members`);
  }

   // POST /api/insurance/groups/{groupId}/sites
   public searchSitesByGroup(groupId: string, searchFilter: BuildingSearchDto): Observable<SiteResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/groups/${groupId}/sites`, searchFilter);
  }


  // DELETE /api/insurance/member/{memberId}
  public deleteMemberByMemberId(memberId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.apiService.delete(`${this.runtimeEndpoint}/insurance/member/${memberId}`, handleLocalError);
  }

  // PATCH /api/insurance/member/{memberId}
  public updateMemberByMemberId(request: MemberDto, handleLocalError: boolean): Observable<MemberDto> {
    return this.apiService.patch(`${this.runtimeEndpoint}/insurance/member/${request.id}`, request, handleLocalError);
  }

  // POST /api/insurance/group/{groupId}/member
  public createMemberByGroupId(groupId: string,
    request: MemberDto, handleLocalError: boolean): Observable<MemberDto> {

    return this.apiService.post(`${this.runtimeEndpoint}/insurance/group/${groupId}/member`, request, null, handleLocalError);
  }

  // POST /api/insurance/transaction
  public createTransaction(dto: TransactionRequestDto): Observable<TransactionResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/transaction`, dto, null, true);
  }

  // GET /api/insurance/transaction/{transactionId}/revertsummary
  public getRevertSummary(transactionId: string): Observable<RevertSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/transaction/${transactionId}/revertsummary`);
  }

  // POST /api/insurance/group/{groupId}/transactions
  public searchTransactionsByGroupId(groupId: string,
    searchFilter: TransactionsSearchFilter): Observable<TransactionsDto> {

    return this.apiService.post(`${this.runtimeEndpoint}/insurance/group/${groupId}/transactions`, searchFilter);
  }

  // POST /api/insurance/transaction/{transactionId}/revert
  public revertTransaction(transactionId: string): Observable<string> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/transaction/${transactionId}/revert`, transactionId, null, true);
  }

  // GET /api/insurance/group/{groupId}/hierarchy
  public getGroupHierarchy(groupId: string): Observable<GroupHierarchyDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/insurance/group/${groupId}/hierarchy`);
  }

  // POST /api/Insurance/Building/ValuationSubmission
  public submitBuildingValuation(buildingIds: string[]): Observable<Array<ValuationResponseDto>> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/building/valuationsubmission`, buildingIds);
  }

  // POST /api/Insurance/Building/FloodPlainSubmission
  public submitFloodPlainValuation(buildingIds: string[]): Observable<Array<ValuationResponseDto>> {
    return this.apiService.post(`${this.runtimeEndpoint}/insurance/building/floodplainsubmission`, buildingIds);
  }
}
