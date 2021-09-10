import { ReportsService } from '../services/reports.service';
import { AlertService } from '../../_core/services/alert.service';
import { FamisGridComponent } from '../../_shared/components/famis-grid.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { reportsHeaders } from './default-reports-headers';
import { WindowRef } from '@agm/core/utils/browser-globals';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { HelperService } from '../../_core/services/helper.service';
import { ReportNameModalComponent } from './report-name-modal.component';
import { WindowManager } from '../../_core/services/window-manager.service';
import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { timer ,  Subscription ,  from, Subject } from 'rxjs';
import { ReportDeliverable } from '../../_api/_runtime/dtos/reporting/report-deliverable.dto';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, Input } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { ReportDto } from '../../_api/_runtime/dtos/reporting/report.dto';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '@ngx-config/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WindowOption } from '../../_models/window-option';
import { FormAction } from '../../_enums/form-action';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { ModalProperties } from '../../_models/modal-properties.model';
import { MetadataDto } from '../../_api/_runtime/dtos/reporting/report-metadata.dto';

@Component({
  selector: 'reports-deliverables',
  templateUrl: 'reports-deliverables.component.html'
})
export class ReportsDeliverablesComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  private defaultColumns = [
    'fileName',
    'reportName',
    'requestedDateTime',
    'status',
  ];
  public deliverablesGrid: FamisGrid;
  @ViewChild(FamisGridComponent, {static: false}) famisGrid: FamisGridComponent;
  @Input() isReadOnly = true;

  private windowSize = 500;
  private destroyed$ = new Subject();
  private groupId: string;
  private timerSubscription: Subscription;
  public isProcessing = false;
  public ssrsReportId: string;
  public availableReports = new Array<ReportDto>();
  public metadataList = new Array<MetadataDto>();
  public reportDeliverables = new Array<ReportDeliverable>();
  public ssrsURL: string;

  // intentionally "any" as the return type ApiServiceResult<Array<ReportDto>> does not accommodate "exception"
  private reportOptionsResult: any;

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private alertService: AlertService,
    private famisGridService: FamisGridService,
    private windowRef: WindowRef,
    private helperService: HelperService,
    private configService: ConfigService,
    private windowManager: WindowManager,
    private modalService: NgbModal,
  ) {
    this.ssrsURL = this.configService.getSettings('ssrsURL');
  }

  ngOnInit() {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.deliverablesGrid = <FamisGrid>{
      height: 600,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'deliverablesGrid',
      supportedOperators: [FamisGridFeature.Sort],
      actions: ['Download', 'Delete'],
      translationBaseKey: this.i18n.reports,
      hideTitle: true,
      scrollingMode: 'normal'
    };

    this.reportsService.getReportMetadataByGroupId(this.groupId).subscribe((metadata: MetadataDto[])=> {
      this.metadataList = metadata;
 
    });

    this.reportsService.getReportOptions(false).subscribe(data => {
      this.reportOptionsResult = data;
      this.availableReports = data.result;
    });
    this.refreshGridData();

    timer(0, 60000).pipe(takeUntil(this.destroyed$))
    .subscribe(() => {
      this.refreshGridData();
    });
  }
  ngOnDestroy() {
    this.destroyed$.next();
  }

  openNameModal() {
    if (this.reportOptionsResult && this.reportOptionsResult.code === 4) {
      this.windowManager.open(this.reportOptionsResult.exception.Message, 'No Service Found Error', <WindowOption>{
        isModal: true,
      });
      return;
    }
    this.isProcessing = true;
    const modal = this.windowManager.open(ReportNameModalComponent, 'Run Report', <WindowOption> {
      isModal: true,
      width: 900
    });
    modal.content.instance.ssrsReportId = this.ssrsReportId;
    //modal.content.instance.availableReports = this.availableReports;
    modal.content.instance.metadataList = this.metadataList;
    modal.content.instance.formResponse.subscribe(result => {
      if (result.action === FormAction.Save) {
            this.alertService.success('Report run submitted.');
            this.refreshGridData();
      }
      modal.close();
    });
    this.isProcessing = false;
  }

  handleActionEvent(event: FamisGridActionEvent) {
    const item = event.item as ReportDeliverable;

    if (event.action === 'Download') {
      if (item.isPending) {
        this.alertService.warn('Report is not ready for download.');
        return;
      }
      this.windowRef.getNativeWindow().open(item.downloadLink, '_blank');
    }

    if (event.action === 'Delete') {
      this.deleteReport(item);
    }
  }

  deleteReport(report: ReportDeliverable) {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties>{
      heading: {
        key: 'Delete Report'
      },
      body: {
        key: 'Are you sure you wish to delete {{report}}?',
        params: {report: report.fileName}
      },
      dismissText: {
        key: 'Cancel'
      },
      successText: {
        key: 'Delete'
      },
      translateBaseKey: this.i18n.reports
    };

    modal.componentInstance.options = modalOptions;

    modal.result.then(
      confirm => {
        this.reportsService.deleteReport(this.groupId, report.id).subscribe(result => {
          this.alertService.success('{{filename}} has been deleted', null, {
            filename: report.fileName
          });
          this.refreshGridData();
      });
    },
      cancel => {}
    );
  }

  refreshGridData() {
    const sortField = 'requestedDateTime';
    const sortDir = 'desc';
    this.deliverablesGrid.loading = this.reportsService.getReportDeliverables()
    .pipe(takeUntil(this.destroyed$))
    .subscribe(data => {
      data.forEach(deliverable => {
        deliverable.status = deliverable.isPending ? 'Pending' : 'Ready';
        deliverable.reportName =decodeURIComponent(deliverable.reportName).substr(decodeURIComponent(deliverable.reportName).lastIndexOf("/") + 1);
        deliverable.fileName = decodeURIComponent(deliverable.fileName);
      });
      this.deliverablesGrid.columnHeaders = reportsHeaders;
      this.deliverablesGrid.selectedHeaders = this.defaultColumns;

      this.famisGridService.setCacheRecords(
        this.helperService.sortCollection(
          data,
          sortField,
          sortDir
        ),
        this.deliverablesGrid.gridId,
        this.famisGridService.defaultSkip,
        data.length,
        this.famisGridService.defaultTake);
    });
  }
}
