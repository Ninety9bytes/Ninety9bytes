import { ReportsService } from '../services/reports.service';
import { PowerBIComponent } from '../../_shared/components/power-bi/power-bi.component';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ReportDto } from '../../_api/_runtime/dtos/reporting/report.dto';

@Component({
    selector: 'reports-power-bi',
    templateUrl: 'reports-power-bi.component.html'
})
export class ReportsPowerBiComponent implements OnInit, TranslatedComponent {
    i18n = TranslationBaseKeys;

    @ViewChild(PowerBIComponent, {static: false}) biEmbeded: PowerBIComponent;
    @Input() isReadOnly = true;

    public isProcessing = false;
    public reportId: string;
    public ssrsURL: string;
    public availableReports = new Array<ReportDto>();
    public report: ReportDto;

    constructor(
        private reportsService: ReportsService
    ) { }

    ngOnInit() {
        this.reportsService.getReportOptions(true).subscribe(data => {
            this.availableReports = data.result;
        });
    }

    runReport() {
        this.isProcessing = true;
        this.report = this.availableReports.find(r => r.id === this.reportId);
        this.biEmbeded.report = this.report;
        this.biEmbeded.displaySelectedReport();
        this.isProcessing = false;
    }
}

