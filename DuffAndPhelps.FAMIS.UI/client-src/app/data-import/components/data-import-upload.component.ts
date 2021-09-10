import { DataImportService } from '../services/data-import.service';
import { AlertService } from '../../_core/services/alert.service';
import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { SpreadsheetColumnDto } from '../../_api/dtos/spreadsheet-column.dto';
import { ModalProperties } from '../../_models/modal-properties.model';
import { NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WizardService } from '../../_ui/services/wizard.service';
import { ActivatedRoute } from '@angular/router';
import { DataImport } from '../../_models/data-import.model';
import { DataTarget } from '../../_models/data-target.model';
import { Locale } from '@progress/kendo-angular-intl';
import { UploadSpreadsheetDto } from '../../_api/dtos/upload-spreadsheet.dto';
import { Subject, forkJoin } from 'rxjs';
import { OnInit, OnDestroy, Component } from '@angular/core';

@Component({
  selector: 'app-data-import-upload',
  templateUrl: './data-import-upload.component.html'
})
export class DataImportUploadComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  private destroyed$ = new Subject<any>();
  public isLoading = false;
  public importAfterReconciliation: boolean = this.dataImportService.importAfterReconciliation;
  public replace = false;
  public isButtonSelected = false;
  public dto: UploadSpreadsheetDto = new UploadSpreadsheetDto();
  public locales: Array<Locale> = new Array<Locale>();
  public availableDataTargets: Array<DataTarget> = new Array<DataTarget>();
  public currentDataTargetId: string;
  public APIError = '';
  public groupId ="";

  dataImport: DataImport;
  showMissingFileAlert = false;

  constructor(
    private route: ActivatedRoute,
    private wizardService: WizardService,
    private alertService: AlertService,
    private modalService: NgbModal,
    public dataImportService: DataImportService
  ) {}

  ngOnInit() {

this.groupId = this.route.parent.snapshot.paramMap.get('groupId');

    if (this.dataImportService.importResult.success) {
      this.dataImportService.resetPublicProperties();
    }

    if (this.dataImportService.activeReplace !== undefined) {
      this.replace = this.dataImportService.activeReplace;
    }

    this.dataImport = this.dataImportService.activeDataImport;

    if (this.dataImport.spreadsheetUpload) {
      this.dto.file = this.dataImport.spreadsheetUpload.file;
      this.dto.fileName = this.dataImport.excelSummary.spreadsheetFileName;
      this.dto.groupId = this.dataImport.spreadsheetUpload.groupId;
      this.dto.localeId = this.dataImport.spreadsheetUpload.localeId;
      this.dto.dataTargetId = this.dataImport.spreadsheetUpload.dataTargetId;
    }

    this.dataImportService
      .getLocales()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        this.locales = result;
      });
forkJoin(
 this.dataImportService.getDataTargets(),
  this.dataImportService.getDataTargetsForGroup(this.groupId)).pipe(takeUntil(this.destroyed$))
      .subscribe(results => {
        if(this.dataImportService.reconciliationStarted){
          this.availableDataTargets = results[0].filter((dataTarget: DataTarget) => {
            return dataTarget.name === 'Client Inventory' || dataTarget.name === 'Actual Inventory';
          });
        } else if(this.dataImportService.reconciliationCompleted) {
          this.availableDataTargets = results[0].filter((dataTarget: DataTarget) => {
            return dataTarget.name.startsWith('Consolidated') || dataTarget.name.includes('Building');
          });
        } else {
          this.availableDataTargets = results[0];
          if( results[1] != null && results[1].length>0 )
          this.availableDataTargets=  this.availableDataTargets.concat(results[1])
      }
      });
    this.dto.groupId = this.route.parent.snapshot.paramMap.get('groupId');
  }

  fileChange(event) {
    const fileList: FileList = event.target.files;

    if (fileList.length > 0) {
      this.dto.file = fileList[0];
      this.showMissingFileAlert = false;
    }
  }

  buttonChange(option: string) {
    this.isButtonSelected = true;
    this.replace = option === 'replace';
  }

  clear() {
    this.dataImport.spreadsheetUpload = null;
  }

  closeAlert(alert) {
    this.showMissingFileAlert = false;
  }

  displayPostReconcilModal(event: MouseEvent, form: NgForm) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const modalOptions = <ModalProperties>{
      heading: {
        key: 'Import Alert'
      },
      body: {
        key: 'If you continue, past reconciliation relationships will be removed.'
      },
      dismissText: {
        key: 'Cancel'
      },
      successText: {
        key: 'Continue'
      },
      translateBaseKey: this.i18n.dataImport
    };

    const modal = this.modalService.open(ConfirmModalComponent, { size: 'lg' });
    modal.componentInstance.options = modalOptions;

    modal.result.then(confirm => {
      this.onSubmit(form);
    },
    cancel => {});
  }

  displayReplaceWarning(form: NgForm) {
    const modalOptions = <ModalProperties>{
      heading: {
        key: 'Data import replace warning'
      },
      body: {
        key: 'Data import replace warning msg'
      },
      dismissText: {
        key: 'Cancel'
      },
      successText: {
        key: 'Continue'
      },
      translateBaseKey: this.i18n.dataImport
    };

    const modal = this.modalService.open(ConfirmModalComponent, { size: 'lg' });
    modal.componentInstance.options = modalOptions;
    modal.result.then(confirm => {
        this.uploadSpreadsheet();
      },
      cancel => {
        this.isLoading = false;
      }
    );
  }

  onSubmit(form) {
    this.isLoading = true;

    if (!this.isButtonSelected) {
      this.isLoading = false;
      return;
    }

    if (form.valid) {
      if (this.replace) {
        this.dataImportService.getDataCountByGroup(this.dto).subscribe(
          (count) => {
            if (count > 0) {
              this.displayReplaceWarning(form);
            } else {
              this.uploadSpreadsheet();
            }
          }
        );
      } else {
        this.uploadSpreadsheet();
      }
    } else {
      this.isLoading = false;
    }
  }

  uploadSpreadsheet() {
    this.dataImportService
          .uploadSpreadsheet(this.dto, this.dto.dataTargetId)
          .pipe(takeUntil(this.destroyed$))
          .subscribe(
            result => {
              // console.log(result);
              if (typeof result === 'number') {
                this.alertService.error(
                  'There was an error processing the file. Please check the file, correct any errors and submit again.'
                );
                this.isLoading = false;
              } else if (result) {
                if (result.importErrors && result.importErrors.length > 0) {
                  this.alertService
                    .error(
                      `There were {{importErrorCount}} import errors.\n* {{importError}} \nPlease correct any errors and submit again.`,
                      null,
                      { importErrorCount: result.importErrors.length, importError: result.importErrors[0] }
                    );
                  this.isLoading = false;
                } else {

                this.dataImportService.getExistingCustomColumns(this.dto.groupId, result.dataTargetDescription.name)
                .pipe(takeUntil(this.destroyed$))
                .subscribe(
                  cols => {
                    this.dataImportService.activeReplace = this.replace;
                    this.dto.dataTargetName = this.availableDataTargets.find(c => c.id === this.dto.dataTargetId).name;

                    this.dataImportService.currentDataTargetId = this.dto.dataTargetId;
                    cols.forEach(c => { c.spreadsheetColumn = <SpreadsheetColumnDto>{}; });
                    this.dataImportService.initDataImport(result, this.dto, cols);
                    this.wizardService.setActiveTab('step-2');
                    this.isLoading = false;
                  }
                );
              }
            } else {
              this.isLoading = false;
              this.showMissingFileAlert = true;
            }
          },
          error => {
            this.isLoading = false;
            this.APIError = error.error;

              // This needs to be more descriptive
              this.showMissingFileAlert = true;
            }
          );
  }

  isConsolidatedSelected() {
    const dataTarget = this.availableDataTargets.find(a => a.id === this.dto.dataTargetId);
    if (dataTarget && dataTarget.name.startsWith('Consolidated')) {
      this.buttonChange('append');
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }
}
