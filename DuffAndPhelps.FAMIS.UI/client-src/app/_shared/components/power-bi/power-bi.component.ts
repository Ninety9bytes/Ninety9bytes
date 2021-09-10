import { Component, OnInit, Input } from '@angular/core';
import * as pbi from 'powerbi-client';
import { ReportsApiService } from '../../../_api/_runtime/services/reports-api.service';
import { ReportDto } from '../../../_api/_runtime/dtos/reporting/report.dto';
import { ActivatedRoute } from '@angular/router';
import { ReportType } from '../../../_api/_runtime/enums/report-type';
import { ReportInfoDto } from '../../../_api/_runtime/dtos/reporting/report-info.dto';

@Component({
  selector: 'app-power-bi',
  templateUrl: './power-bi.component.html'
})
export class PowerBIComponent implements OnInit {

  @Input() report: ReportDto;
  @Input() isDefaultDashboard: boolean;
  @Input() filterPaneEnabled: boolean;
  @Input() filters: Array<pbi.models.IFilter>;

  public isLoading: boolean;
  public groupId: string;

  constructor
  (private reportService: ReportsApiService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.filters = this.getPowerBiFilters();
    this.displaySelectedReport();
  }

  public displaySelectedReport() {
    if (this.isDefaultDashboard) {
      this.isLoading = true;
      this.reportService.GetDefaultDashboard(this.groupId).subscribe(res => {
        const reportType = this.GetEmbededReportType(ReportType.PowerBiDashboard);
        this.showReport(res, reportType);
      });
    }
    if (this.report) {
      this.isLoading = true;
      this.reportService.GetReportOrDashboardInfo(this.groupId, this.report.id, this.report.type).subscribe(res => {
        this.showReport(res, this.GetEmbededReportType(this.report.type));
      });
    }
  }
  private showReport(reportInfo: ReportInfoDto, reportType: string): void {

      const config = <pbi.IEmbedConfiguration>{
        type: reportType,
        tokenType: pbi.models.TokenType.Embed,
        accessToken: reportInfo.reportToken,
        embedUrl: reportInfo.reportUrl,
        id: reportInfo.reportId,
        pageView: 'fitToWidth',
        filters: this.filters,
        settings: {
          filterPaneEnabled: this.filterPaneEnabled
        }
      };

      const reportContainer = <HTMLElement>document.getElementById('reportContainer');
      const powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
      powerbi.reset(reportContainer);
      const rpt = powerbi.embed(reportContainer, config);

      rpt.off('loaded');
      rpt.on('loaded', () => {
        this.isLoading = false;
      // Add styling to the iFrame that gets added by the power bi library so it
      // displays at a resonable height instead of being ~100 px tall
        const reportIframe = <HTMLElement>reportContainer.getElementsByTagName('iframe').item(0);
        reportIframe.setAttribute('style', 'min-height:850px; width:100%');
        // console.log('Loaded');
      });
  }

  private GetEmbededReportType(type: ReportType): string {
    if (type === ReportType.PowerBiDashboard) {
        return 'dashboard';
    } else if (type === ReportType.PowerBi) {
        return 'report';
    }
    return 'Unknown';
  }

  private getPowerBiFilters(): Array<pbi.models.IFilter> {
    return [this.createGroupFilter()];
  }

  private createGroupFilter(): pbi.models.IBasicFilter {
    return {
      $schema: 'http://powerbi.com/product/schema#basic',
      operator: 'In',
          values: [this.groupId],
          target: {
            table: 'VW_Group',
            column: 'GroupId'
          },
      filterType: pbi.models.FilterType.Basic
    };
  }
}

