import { FormGroupDirective } from '@angular/forms';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { ReportsService } from '../services/reports.service';
import { Component, OnInit, OnDestroy, ViewChild, Input, EventEmitter } from '@angular/core';
import { ReportDto } from '../../_api/_runtime/dtos/reporting/report.dto';
import { FilterColumnOption, FilterColumnOperation,
  ReportFilterValueDto, 
  ReportFilterOptionsDto,
  DeliverableRequestDetailDto} from '../../_api/_runtime/dtos/reporting/report-filter-options.dto';
import { Subject } from 'rxjs';
import { FormActionEvent } from '../../_models/form-action-event.model';
import { ReportDeliverable } from '../../_api/_runtime/dtos/reporting/report-deliverable.dto';
import { ConfigService } from '@ngx-config/core';
import { FormAction } from '../../_enums/form-action';
import { MetadataDto } from '../../_api/_runtime/dtos/reporting/report-metadata.dto';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { RowClassArgs, SelectionEvent, GridDataResult, PageChangeEvent, DataStateChangeEvent,
  SelectableSettings } from '@progress/kendo-angular-grid';


@Component({
  selector: 'report-name-modal',
  templateUrl: './report-name-modal.component.html'
})

export class ReportNameModalComponent implements TranslatedComponent, OnInit, OnDestroy {
  i18n = TranslationBaseKeys;

  @ViewChild('reportNameForm', {static: false}) form: FormGroupDirective;
  @Input() ssrsReportId: string;
  @Input() metadataList: Array<MetadataDto>;
  @Input() translatedBaseKey: string;
  public filterMetaData: Array<FilterColumnOption>;
  public filterOperations: Array<FilterColumnOperation>;
  public selectedMetadata = new Array<MetadataDto>();
  public availableReports = new Array<ReportDto>();

  private destroyed$ = new Subject();
  isFilterEnabled = false;

  formResponse = new EventEmitter<FormActionEvent>();

  fileExtension: string;
  requestedReport = <ReportDeliverable>{};
  isNameEmpty = true;
  validName = true;
  loadingOptions = false;
  canAddFilter = true;
  isValid = false;
  private maxParameters: number;

  public reportFilters = new Array<ReportFilterValueDto>();

  public selectableSettings = <SelectableSettings> {
    checkboxOnly: true,
    mode: 'multiple'
  };

  state: State = {
    sort: <SortDescriptor[]>[{
      dir: 'asc',
      field: 'tagName'
    }]

  };

  public sortSelectedAsc = false;
  public sortSelectedDesc = false;
  gridData : any[]

  constructor(
    private configService: ConfigService,
    private reportsService: ReportsService,
    ) { }

  ngOnInit() {
    this.translatedBaseKey = this.i18n.reports;
    this.maxParameters = this.configService.getSettings('reportParameterLimit');
    this.gridData = process(this.metadataList, this.state);
    this.reportsService.getReportOptionsByMetadata(false,this.selectedMetadata).subscribe(data => {
      this.availableReports = data;
 });

  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
 
  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.metadataList, this.state);
  }

  updateExtension (reportId: string) {
    const selectedReport = this.availableReports.find(x => x.id === reportId);
    this.fileExtension = selectedReport.fileExtension;
    this.resetFilterOptions(selectedReport);
  }

  resetFilterOptions(report: ReportDto): void {
    this.isFilterEnabled = (!report.isFixedAsset && !report.isInsurance) ? false : true;
    if (!this.isFilterEnabled) { return; }
    this.loadingOptions = true;
    this.reportsService.getReportFilterMetadata(report.id)
      .subscribe((reportOptions: ReportFilterOptionsDto) => {
        this.filterMetaData = reportOptions.filterColumnOptions
          .sort((a, b) => (a.columnName > b.columnName) ? 1 : -1);
        this.filterOperations = reportOptions.filterColumnOperations
          .sort((a, b) => (a.operationName > b.operationName) ? 1 : -1);
        this.reportFilters = new Array<ReportFilterValueDto>();
        this.loadingOptions = false;
        this.canAddFilter = reportOptions.filterColumnOptions.length > 0;
    });
  }

  formatFilterTermName(name: string, prefix: string): string {
    const prefixLength = prefix.length;
    const formattedName = name.charAt(prefixLength).toLocaleLowerCase() + name.substring(prefixLength + 1);
    return formattedName;
  }

  dismiss() {
    this.formResponse.emit({ action: FormAction.Cancel });
  }

  validateName(fileName: string) {
    const validNamePattern = new RegExp('[\\/:"*?<>|\\\\]+');
    this.validName = !validNamePattern.test(fileName);
  }

  runReport() {
    const reportRequest = {} as DeliverableRequestDetailDto;
    reportRequest.fileName = this.requestedReport.fileName;
    reportRequest.outputType = this.fileExtension;
    reportRequest.reportFilters = this.reportFilters;
    this.reportsService.requestDeliverable(this.ssrsReportId, reportRequest)
        .subscribe(res => {
          this.reportsService.clearTermsForFilterCriteria();
          this.formResponse.emit({ action: FormAction.Save });
      });
  }
  remove() {
    this.reportFilters.pop();
    this.canSubmit();
  }

  addFilter() {

    const filterValue = {} as ReportFilterValueDto;
    filterValue.filterColumnId = '';
    filterValue.filterOperationId = '';
    this.reportFilters.push(filterValue);
    this.canAddFilter = this.reportFilters.length < this.maxParameters;
    this.canSubmit();
  }

  canSubmit(): void {
    if (this.reportFilters.length > 0) {
      for (const filter of this.reportFilters) {
        if (!filter.filterColumnId || !filter.filterOperationId || !filter.filterValue) {
          this.isValid = false;
          return;
        }
      }
    }
    if (this.ssrsReportId && this.requestedReport.fileName) {
      this.isValid = true;
      return;
    }
    this.isValid = false;
    return;
  }

  onCheckboxChange(metadata, event) {
    if(event.target.checked) {
      this.selectedMetadata.push(metadata);
    } else {
 
  this.selectedMetadata.forEach( (item, index) => {
    if(item === metadata) this.selectedMetadata.splice(index,1);
  });

 }
  this.reportsService.getReportOptionsByMetadata(false,this.selectedMetadata).subscribe(data => {
      this.availableReports = data;
 });
}

onSelectionChanged(args?: SelectionEvent) {
  setTimeout(() => {
    if(args.deselectedRows != null && args.deselectedRows.length > 0){
    this.onDeselectedRows(args.deselectedRows);
    this.reportsService.getReportOptionsByMetadata(false,this.selectedMetadata).subscribe(data => {
      this.availableReports = data;
 });
    }
    if (args.selectedRows != null && args.selectedRows.length > 0) {
      this.UpdateSelectedRows(args.selectedRows);
      this.reportsService.getReportOptionsByMetadata(false,this.selectedMetadata).subscribe(data => {
        this.availableReports = data;
   });
    }
  
  });
}

private onDeselectedRows(deselectedRows: Array<any>){
  if (deselectedRows == null || deselectedRows.length === 0) {
    return;
  }

   deselectedRows.forEach(value => {
    const metadata = this.metadataList.find(c => c.id === value.dataItem.id);
    this.selectedMetadata.forEach( (item, index) => {
      if(item === metadata) this.selectedMetadata.splice(index,1);
    });
  });
    
}

private UpdateSelectedRows(selectedRows: Array<any>) {
  selectedRows.forEach(value => {
    const metadataa = this.metadataList.find(c => c.id === value.dataItem.id);
    this.selectedMetadata.push(metadataa);
  });
}

}
