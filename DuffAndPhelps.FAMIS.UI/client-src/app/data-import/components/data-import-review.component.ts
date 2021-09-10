import { SortDescriptor, orderBy } from '@progress/kendo-data-query/dist/es/main';
import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { AlertService } from '../../_core/services/alert.service';
import { takeUntil } from 'rxjs/operators';
import { ImportResultDto } from '../../_api/dtos/import-result.dto';
import { ImportSpreadsheetDto } from '../../_api/dtos/import-spreadsheet.dto';
import { WizardService } from '../../_ui/services/wizard.service';
import { DataImport } from '../../_models/data-import.model';
import { GridDataResult } from '@progress/kendo-angular-grid/dist/es2015/main';
import { Subject } from 'rxjs';
import { OnInit, OnDestroy, Component } from '@angular/core';

@Component({
  selector: 'app-data-import-review',
  templateUrl: './data-import-review.component.html'
})
export class DataImportReviewComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  private destroyed$ = new Subject<any>();
  public multiple = false;
  public allowUnsort = true;
  public headers: any;
  public dto: ImportSpreadsheetDto;
  public APIError = '';

  isLoading: boolean;
  spreadsheetHasErrors = false;

  sort: SortDescriptor[] = [];
  private gridView: GridDataResult;
  sampleData: any[];

  private dataImport: DataImport;

  constructor(
    private wizardService: WizardService,
    private dataImportService: DataImportService,
    private alertService: AlertService
  ) {}

  sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadSampleData();
  }

  private loadSampleData(): void {
    this.gridView = {
      data: orderBy(this.sampleData, this.sort),
      total: this.sampleData.length
    };
  }

  ngOnInit(): void {
    this.dataImport = this.dataImportService.activeDataImport;

    const spreadSheetMapping = this.dataImport.mapping.filter(c => !!c.spreadsheetColumn && !!c.spreadsheetColumn.name);
    const uniqueColumn = spreadSheetMapping.find(column => {
      return column.importTemplateColumnId === this.dataImportService.currentKeyFieldId;
    });

    this.dto = new ImportSpreadsheetDto(
      this.dataImport.excelSummary.id,
      this.dataImport.spreadsheetUpload.groupId,
      this.dataImport.spreadsheetUpload.dataTargetId,
      10,
      {
        SpreadsheetMappings: spreadSheetMapping,
        Mode: this.dataImportService.activeReplace === true ? 0 : 1,
        UniqueIdentifierColumn: uniqueColumn
      }
    );

    this.dataImportService
      .getReviewData(this.dto)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        if (data && data.dataRows) {
          this.sampleData = data.dataRows;
          this.headers = this.getKeys(this.sampleData[0]);
        }
      },
      error => {
        this.APIError = error.error;
        this.spreadsheetHasErrors = true;
        this.dataImportService.importResult.errors = ['error'];
        this.alertService.error(!!error.error ? error.error : 'An unknown error has occurred while importing the spreadsheet');
      });
  }

  back(event) {
    event.preventDefault();
    this.wizardService.setActiveTab('step-2');
  }

  onSubmit(form) {
    this.isLoading = true;

    this.dataImportService
      .importSpreadsheet(this.dto)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(data => {
        const importResult = new ImportResultDto(data.success, data.rowsAdded, data.rowsUpdated, data.errors, data.name);

        this.isLoading = false;
        this.wizardService.setActiveTab('step-4');
        this.dataImportService.importResult = importResult;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private getKeys(obj) {
    const keys = Object.keys(obj).map(key => {
      return { key: key };
    });

    return keys;
  }
}
