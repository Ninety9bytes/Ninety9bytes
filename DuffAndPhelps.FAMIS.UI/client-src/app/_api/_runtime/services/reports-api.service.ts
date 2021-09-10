import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { ReportDto } from '../dtos/reporting/report.dto';
import { ReportDeliverable } from '../dtos/reporting/report-deliverable.dto';
import { DeliverableRequestDetailDto } from '../dtos/reporting/report-filter-options.dto';
import { ReportInfoDto } from '../dtos/reporting/report-info.dto';
import { ReportType } from '../enums/report-type';
import { MetadataDto } from '../dtos/reporting/report-metadata.dto';
import {map, tap} from 'rxjs/operators';
import { GroupMetadataDto } from '../dtos/reporting/report-group.metadata.dto';


@Injectable()
export class ReportsApiService {

  private runtimeEndpoint = this.configService.getSettings(
    'runtimeApiEndpoint'
  );

  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {}

  // GET /api/Reports/AvailableDeliverables
  public getAvailableReportsByGroupId(groupId: string, isPowerBi: boolean): Observable<ApiServiceResult<Array<ReportDto>>> {
    return this.apiService
    .get(`${this.runtimeEndpoint}/reports/AvailableDeliverables?groupId=${groupId}&isPowerBi=${isPowerBi}&isPortal=false`);
  }

  // POST /api/Reports/AvailableDeliverables
  public getAvailableReportsByGroupIdAndMetadata(groupId: string, isPowerBi: boolean, selectedMetadata: Array<MetadataDto>): Observable<Array<ReportDto>> {
      return this.apiService
      .post(`${this.runtimeEndpoint}/reports/AvailableDeliverables?groupId=${groupId}&isPowerBi=${isPowerBi}&isPortal=false`,selectedMetadata)
      .pipe(map(c => c.result));
  }

  // GET /api/Reports/Metadata
  public getReportMetadata(groupId: string): Observable<MetadataDto[]> {
        return this.apiService
        .get(`${this.runtimeEndpoint}/reports/Metadata?groupId=${groupId}&isPortal=false` )
        .pipe(map(c => c.result));
  }

    // GET /api/Reports/Metadata
    public getReportMetadataByGroupId(groupId: string): Observable<MetadataDto[]> {
      return this.apiService
      .get(`${this.runtimeEndpoint}/reports/MetadataByGroupId?groupId=${groupId}&isPortal=false` )
      .pipe(map(c => c.result));
}
   // GET /api/Reports/GroupMetadata
   public getGropuMetadataByGroupId(groupId: string): Observable<GroupMetadataDto[]> {
    return this.apiService
    .get(`${this.runtimeEndpoint}/reports/GroupMetadata?groupId=${groupId}&isPortal=false` )
    .pipe(map(c => c.result));
} 

  // POST /api/Reports/GroupMetadata
  public createGroupMetadata(groupId: string,metadata: Array<MetadataDto>): Observable<GroupMetadataDto[]> {
    return this.apiService
    .post(`${this.runtimeEndpoint}/reports/GroupMetadata?groupId=${groupId}&isPortal=false`,metadata )
    
}

// POST /api/Reports/GroupMetadata
public deleteGroupMetadata(groupId: string,metadata: Array<MetadataDto>): Observable<GroupMetadataDto[]> {
  return this.apiService
  .post(`${this.runtimeEndpoint}/reports/DeleteGroupMetadata?groupId=${groupId}&isPortal=false`,metadata )
  
}
  // Get /api/Reports/Deliverables
  public getRequestedDeliverablesByGroupId(groupId: string): Observable<Array<ReportDeliverable>> {
    return this.apiService.get(`${this.runtimeEndpoint}/reports/Deliverables?groupId=${groupId}`);
  }

  // Post /api/Reports/Deliverable
  public requestDeliverable(groupId: string, reportId: string,
    details: DeliverableRequestDetailDto): Observable<ReportDeliverable> {
    return this.apiService.post(`${this.runtimeEndpoint}/reports/Deliverable?groupId=${groupId}&reportId=${reportId}`,
    details);
  }

  public getReportFilterMetadata(groupId: string, reportId: string){
    return this.apiService.get(`${this.runtimeEndpoint}/reports/filterOptions?groupId=${groupId}&isPortal=false&reportId=${reportId}`);
  }

  public GetDefaultDashboard(groupId: string): Observable<ReportInfoDto> {
    return this.getDashboardInfo(groupId, null);
  }

  public GetReportOrDashboardInfo(groupId: string, reportId: string, type: ReportType) {
    if (type === ReportType.PowerBi) {
      return this.getReportInfo(groupId, reportId);
    }
    if (type === ReportType.PowerBiDashboard) {
      return this.getDashboardInfo(groupId, reportId);
    }
  }

  // GET /api/Reports/Dashboard
  private getDashboardInfo(groupId: string, reportId: string): Observable<ReportInfoDto> {
    let params = `?portalId=${groupId}`;
    if (reportId) {
      params += `&reportId=${reportId}`;
    }
    return this.apiService.get(`${this.runtimeEndpoint}/reports/Dashboard${params}`);
  }

  // Get /api/Report/Report
  private getReportInfo(groupId: string, reportId: string): Observable<ReportInfoDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/reports/Report?portalId=${groupId}&reportId=${reportId}`);
  }

  public deleteReport(groupId: string, reportId: string): Observable<ReportInfoDto> {
    return this.apiService.delete(`${this.runtimeEndpoint}/reports/DeleteReport?groupOrPortalId=${groupId}&id=${reportId}`);
  }
}
