import { Injectable } from '@angular/core';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { AssetFilterTermDto } from '../../_api/_runtime/dtos/asset-filter-term.dto';
import { MemberResponseDto, MemberDto } from '../../_api/_runtime/dtos/member.dto';
import { Observable } from 'rxjs';
import { BuildingSearchDto } from '../../_api/_runtime/dtos/building-search.dto';
import { AccountResponseDto, AccountDto } from '../../_api/_runtime/dtos/account.dto';
import { DepartmentResponseDto, DepartmentDto } from '../../_api/_runtime/dtos/department.dto';
import { SiteResponseDto, SiteDto } from '../../_api/_runtime/dtos/site.dto';
import { AssetFileSummaryDto } from '../../_api/_runtime/dtos/asset-file-summary.dto';

@Injectable()
export class HeaderManagementService {
  public groupId: string;
  public dataTarget: number;

  public defaultSortTerms = [
    <AssetSortTermDto>{
      termOrder: 0,
      sortDirection: 1,
      field: ''
    }
  ];

  constructor(
    private inventoryApiService: InventoryApiService,
    private insuranceApiService: InsuranceApiService
  ) {}

  public updateMemberData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<
      AssetSortTermDto
    >(),
    filterTerms: Array<AssetFilterTermDto> = new Array<
      AssetFilterTermDto
    >()
  ): Observable<MemberResponseDto> {
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

    return this.insuranceApiService.searchMemberssByGroup(this.groupId, searchRequest);
  }

  public updateAccountData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<
      AssetSortTermDto
    >(),
    filterTerms: Array<AssetFilterTermDto> = new Array<
      AssetFilterTermDto
    >()
  ): Observable<AccountResponseDto> {
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

    return this.inventoryApiService.searchAccountByGroup(this.groupId, searchRequest);
  }

  public updateDepartmentData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<
      AssetSortTermDto
    >(),
    filterTerms: Array<AssetFilterTermDto> = new Array<
      AssetFilterTermDto
    >()
  ): Observable<DepartmentResponseDto> {
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

    return this.inventoryApiService.searchDepartmentByGroup(this.groupId, searchRequest);
  }

  public updateSiteData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<AssetSortTermDto> = new Array<
      AssetSortTermDto
    >(),
    filterTerms: Array<AssetFilterTermDto> = new Array<
      AssetFilterTermDto
    >()
  ): Observable<SiteResponseDto> {

    const siteSortTerms = [
      <AssetSortTermDto>{
        termOrder: 0,
        sortDirection: 1,
        field: 'siteName'
      }
    ];

    const defaultFilter = [];

    const searchRequest = <BuildingSearchDto>{
      filterTerms:
        !!filterTerms && filterTerms.length > 0 ? filterTerms : defaultFilter,
      filterConjunction: 'and',
      excludeMatchedRecords: false,
      sortTerms:
        !!sortTerms && sortTerms.length > 0 ? sortTerms : siteSortTerms,
      skip: skip,
      take: take
    };

    return this.insuranceApiService.searchSitesByGroup(this.groupId, searchRequest);
  }


  public getMemberMetadata(): Observable<AssetFileSummaryDto> {
    return this.insuranceApiService.getMembersSearchMetadata();
  }

  public getSiteMetadata(): Observable<AssetFileSummaryDto> {
    return this.insuranceApiService.getSiteSearchMetadata();
  }

  public getAccountMetadata(): Observable<AssetFileSummaryDto> {
    return this.inventoryApiService.getAccountSearchMetadata();
  }

  public getDepartmentMetadata(): Observable<AssetFileSummaryDto> {
    return this.inventoryApiService.getDepartmentSearchMetadata();
  }

  public getSiteData(groupId: string): Observable<Array<SiteDto>> {
    return this.insuranceApiService.getSitesByGroup(groupId);
  }

  public getAccountData(groupId: string): Observable<Array<AccountDto>> {
    return this.inventoryApiService.getAccountsByGroupId(groupId);
  }

  public getDeparmentsData(groupId: string): Observable<Array<DepartmentDto>> {
    return this.inventoryApiService.getDepartmentsByGroupId(groupId);
  }

  /*** Upsert Methods ***/

  public upsertMember(member: MemberDto, isNew: boolean): Observable<MemberDto> {
    if (isNew) {
      return this.insuranceApiService.createMemberByGroupId(this.groupId, member, true);
    } else {
      return this.insuranceApiService.updateMemberByMemberId(member, true);
    }
  }

  public upsertSite(site: SiteDto, isNew: boolean): Observable<SiteDto> {
    if (isNew) {
      return this.insuranceApiService.createSiteByGroupId(this.groupId, site, true);
    } else {
      return this.insuranceApiService.updateSiteBySiteId(site, true);
    }
  }

  public upsertAccount(account: AccountDto, isNew: boolean): Observable<AccountDto> {
    if (isNew) {
      return this.inventoryApiService.createAccountByGroupId(this.groupId, account);
    } else {
      return this.inventoryApiService.updateAccountByAccountId(account);
    }
  }

  public upsertDepartment(department: DepartmentDto, isNew: boolean): Observable<DepartmentDto> {
    if (isNew) {
      return this.inventoryApiService.createDepartmentByGroupId(this.groupId, department);
    } else {
      return this.inventoryApiService.updateDepartmentByDepartmentId(department);
    }
  }

  /*** Delete Methods ***/
  public deleteMember(memberId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.insuranceApiService.deleteMemberByMemberId(memberId, handleLocalError);
  }

  public deleteSite(siteId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.insuranceApiService.deleteSiteBySiteId(siteId, handleLocalError);
  }

  public deleteAccount(accountId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.inventoryApiService.deleteAccountByAccountId(accountId, handleLocalError);
  }

  public deleteDepartment(departmentId: string, handleLocalError?: boolean): Observable<boolean> {
    return this.inventoryApiService.deleteDepartmentByDepartmentId(departmentId, handleLocalError);
  }
}
