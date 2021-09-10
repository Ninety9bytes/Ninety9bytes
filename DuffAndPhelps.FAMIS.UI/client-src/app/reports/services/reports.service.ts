import { ReportsApiService } from '../../_api/_runtime/services/reports-api.service';
import { FilterOperationsService } from '../../_core/services/filter-operations.service';
import { Injectable } from '@angular/core';
import { AssetSortTermDto, AssetFilterTermDto, AssetSearchDto } from '../../_api/dtos/inventory/asset-search.dto';
import { BehaviorSubject, Observable } from 'rxjs';
import { MassUpdateContext } from '../../_api/_runtime/dtos/mass-update-context.dto';
import { MassUpdateRequestDto } from '../../_api/_runtime/dtos/mass-update-request.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { ReportDto } from '../../_api/_runtime/dtos/reporting/report.dto';
import { ReportDeliverable } from '../../_api/_runtime/dtos/reporting/report-deliverable.dto';
import { ReportFilterOptionsDto, DeliverableRequestDetailDto } from '../../_api/_runtime/dtos/reporting/report-filter-options.dto';
import { ReportInfoDto } from '../../_api/_runtime/dtos/reporting/report-info.dto';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';
import { MetadataDto } from '../../_api/_runtime/dtos/reporting/report-metadata.dto';
import { GroupMetadataDto } from '../../_api/_runtime/dtos/reporting/report-group.metadata.dto';

@Injectable()
export class ReportsService {

  groupId: string;

  constructor(
    private reportsApiService: ReportsApiService,
    private filterOperationsService: FilterOperationsService,
  ) { }

  public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'id' }];
  public defaultFilterTerms = [<AssetFilterTermDto>{ operation: 'noop', term: {dataTarget: 0, field: '', value: ''}}];
  private reportContextSource = new BehaviorSubject<MassUpdateContext>(<MassUpdateContext>{});
  public reportContext$ = this.reportContextSource.asObservable();

  private reportCriteriaSearchSource = new BehaviorSubject<AssetSearchDto>(<AssetSearchDto>{
    fieldMatchTerms: [],
    fieldMatchConjunction: 'and',
    filterTerms : this.defaultFilterTerms,
    filterConjunction: 'and',
    excludeMatchedRecords: false,
    sortTerms: this.defaultSortTerms,
    skip: 0,
    take: 0
  });

  public reportCriteriaSearch$ = this.reportCriteriaSearchSource.asObservable();

    private reportRequestSource = new BehaviorSubject<MassUpdateRequestDto>(<MassUpdateRequestDto>{
        field: '',
        textReplaceValue: null,
        filterTerms: this.defaultFilterTerms,
        filterConjunction: 'and',
        sortTerms: this.defaultSortTerms
    });

  public reportRequest$ = this.reportRequestSource.asObservable();


  public getReportOptions(isPowerBi: boolean): Observable<ApiServiceResult<Array<ReportDto>>> {
    return this.reportsApiService.getAvailableReportsByGroupId(this.groupId, isPowerBi);
  }

  public getReportDeliverables(): Observable<Array<ReportDeliverable>> {
    return this.reportsApiService.getRequestedDeliverablesByGroupId(this.groupId);
  }

  public getReportOptionsByMetadata(isPowerBi: boolean, selectedMetadata: Array<MetadataDto>): Observable<Array<ReportDto>> {
    return this.reportsApiService.getAvailableReportsByGroupIdAndMetadata(this.groupId,isPowerBi,selectedMetadata);
  }

  public getReportMetadata(groupId: string): Observable<MetadataDto[]> {
    return this.reportsApiService.getReportMetadata(groupId);
  }

  public getReportMetadataByGroupId(groupId: string): Observable<MetadataDto[]> {
    return this.reportsApiService.getReportMetadataByGroupId(groupId);
  }

  public getGropuMetadataByGroupId(groupId: string): Observable<GroupMetadataDto[]> {
    return this.reportsApiService.getGropuMetadataByGroupId(groupId);
  }
  
  public createGroupMetadata(groupId: string,metadata: Array<MetadataDto>): Observable<GroupMetadataDto[]> {
    return this.reportsApiService.createGroupMetadata(groupId,metadata);
  }

  public deleteGroupMetadata(groupId: string,metadata: Array<MetadataDto>): Observable<GroupMetadataDto[]> {
    return this.reportsApiService.deleteGroupMetadata(groupId,metadata);
  }

  public getReportFilterMetadata(reportId: string): Observable<ReportFilterOptionsDto> {
    return this.reportsApiService.getReportFilterMetadata(this.groupId, reportId);
  }

  public requestDeliverable(reportId: string,
    reportDetail: DeliverableRequestDetailDto): Observable<ReportDeliverable> {
    return this.reportsApiService.requestDeliverable(this.groupId, reportId, reportDetail);
  }

  public deleteReport(groupId: string, reportId: string): Observable<ReportInfoDto> {
    return this.reportsApiService.deleteReport(groupId, reportId);
  }

  public addOrUpdateFilter(filterModified: FilterDto): void {
    const current = this.reportCriteriaSearchSource.getValue();
    current.filterTerms = this.filterOperationsService.updateFilter
    (filterModified, current.filterTerms);
    this.reportCriteriaSearchSource.next(current);
  }

  public removeFilter(id: string): void {
    const current = this.reportCriteriaSearchSource.getValue();
    current.filterTerms = this.filterOperationsService.removeFilter(id, current.filterTerms);
    this.reportCriteriaSearchSource.next(current);
  }

  public clearTermsForFilterCriteria() {
      const current = this.reportCriteriaSearchSource.getValue();
      current.filterTerms = [];

      this.reportCriteriaSearchSource.next(current);
  }
}
