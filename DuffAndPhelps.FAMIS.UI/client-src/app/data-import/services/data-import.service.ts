import { AlertService } from '../../_core/services/alert.service';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { DataImport } from '../../_models/data-import.model';
import { ImportResultDto } from '../../_api/dtos/import-result.dto';
import { DataImportRepository } from '../../_api/services/data-import/data-import-repository.service';
import { UploadSpreadsheetDto } from '../../_api/dtos/upload-spreadsheet.dto';
import { ColumnMap } from '../../_models/column-map.model';
import { ExcelSummaryDto } from '../../_api/dtos/excel-summary.dto';
import { DataTargetDescription } from '../../_models/data-target-description.model';
import { SpreadsheetColumnDto } from '../../_api/dtos/spreadsheet-column.dto';
import { ImportSpreadsheetDto } from '../../_api/dtos/import-spreadsheet.dto';
import { ImportTemplateDto } from '../../_api/dtos/data-import/import-template.dto';
import { SupportedCustomColumnDataTypeDto } from '../../_api/dtos/shared/supported-custom-column-datatype.dto';
import { Locale } from '../../_models/locale.model';
import { HeaderRow } from '../../_models/header-row.model';
import { DataTargetField } from '../../_models/data-target-field.model';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { DataTargetName } from '../../_enums/data-target-name';

@Injectable()
export class DataImportService {
  runtimeEndpoint: string;
  configurationEndpoint: string;
  importAfterReconciliation: boolean;
  reconciliationStarted: boolean;
  reconciliationCompleted: boolean;
  dataImportHistory: boolean;
  activeReplace: boolean;
  activeDataImport: DataImport = new DataImport();
  currentDataTargetId: string;
  currentImportTemplate: ImportTemplateDto = <ImportTemplateDto>{};
  currentKeyFieldId: string;
  importResult: ImportResultDto = new ImportResultDto();

  constructor(
    private repository: DataImportRepository,
    private alertService: AlertService,
    private inventoryApiService: InventoryApiService
  ) {}

  initDataImport(result: any, spreadsheetUpload: UploadSpreadsheetDto, groupDataCustomColumns: Array<ColumnMap>) {
    const excelSummary = new ExcelSummaryDto(
      result.id,
      this.mapSpreadsheetColumns(result.spreadsheetColumns),
      result.spreadsheetFilename,
      this.mapHeaderRow(result.headerRow),
      this.mapTargetDescription(result.dataTargetDescription),
      []
    );

    this.activeDataImport.excelSummary = excelSummary;
    this.activeDataImport.spreadsheetUpload = spreadsheetUpload;

    this.activeDataImport.mapping = this.getMappedColumns(
      <DataTargetDescription>result.dataTargetDescription,
      <Array<SpreadsheetColumnDto>>result.spreadsheetColumns
    );
    groupDataCustomColumns.forEach(colMap => {
      this.activeDataImport.mapping.push(colMap);
    });
  }

  getReviewData(dto: ImportSpreadsheetDto): Observable<any> {
    return this.repository.getReviewData(dto);
  }

  getDataTargets(): Observable<ImportTemplateDto[]> {
    return this.repository.getDataTargets();
  }

  getDataTargetsForGroup(groupId: string): Observable<ImportTemplateDto[]> {
    return this.repository.getDataTargetsForGroup(groupId);
  }

  getCustomColumnDataTypes(): Observable<SupportedCustomColumnDataTypeDto[]> {
    return this.repository.getCustomColumnDataTypes();
  }

  uploadSpreadsheet(dto: UploadSpreadsheetDto, importTemplateId: string): Observable<number | ExcelSummaryDto> {
    this.resetPublicProperties();
    return this.repository.uploadSpreadsheet(dto, importTemplateId);
  }

  getExistingCustomColumns(groupId: string, dataTargetName: string): Observable<Array<ColumnMap>> {
    return this.repository.getCustomColumns(groupId, dataTargetName);
  }

  importSpreadsheet(dto: ImportSpreadsheetDto): Observable<ImportResultDto> {
    return this.repository.importSpreadsheet(dto);
  }

  private getMappedColumns(
    dataTargetDescription: DataTargetDescription,
    spreadsheetColumns: Array<SpreadsheetColumnDto>
  ): Array<ColumnMap> {
    const mappedColumns = new Array<ColumnMap>();

    spreadsheetColumns.forEach(col => {
      col.title = col.title.toLowerCase();
    });

    dataTargetDescription.columns.forEach(dataTargetCol => {
      const mappedSpreadsheetCol = spreadsheetColumns.find
        (c => c.title.replace(/\s+/g, '') === dataTargetCol.name.toLowerCase().replace(/\s+/g, '')
      );

      if (mappedSpreadsheetCol) {
        mappedColumns.push(<ColumnMap>{
          spreadsheetColumn: <SpreadsheetColumnDto>{
            name: mappedSpreadsheetCol.name,
            title: mappedSpreadsheetCol.title,
            sampleData: mappedSpreadsheetCol.sampleData
          },
          importTemplateColumnId: dataTargetCol.id,
          dataTargetField: dataTargetCol.name,
          isAutoMapped: true,
          columnDataType: dataTargetCol.type,
          colLength:dataTargetCol.collen
          });
      } else {
        mappedColumns.push(<ColumnMap>{
          spreadsheetColumn: <SpreadsheetColumnDto>{},
          importTemplateColumnId: dataTargetCol.id,
          dataTargetField: dataTargetCol.name,
          isAutoMapped: false,
          columnDataType: dataTargetCol.type,
          colLength: dataTargetCol.collen
        });
      }
    });

    return mappedColumns;
  }

  isAutoMappedColumn(headingName: string) {
    this.activeDataImport.excelSummary.dataTargetDescription.columns.forEach(column => {
      if (column.name === headingName) {
        return true;
      }
    });

    return false;
  }

  setMapping(mapping: Array<ColumnMap>) {
    // console.log(mapping);
    this.activeDataImport.mapping = mapping;
  }

  getLocales(): Observable<Locale[]> {
    return of([
      new Locale('1', 'United States - English'),
      new Locale('2', 'Mexico - Spanish'),
      new Locale('3', 'Canada - French')
    ]);
  }

  resetPublicProperties() {
    this.importAfterReconciliation = false;
    this.activeReplace = true;
    this.activeDataImport = new DataImport();
    this.importResult = new ImportResultDto();
  }

  private mapSpreadsheetColumns(spreadsheetColumns: any): Array<SpreadsheetColumnDto> {
    const columns = new Array<SpreadsheetColumnDto>();

    spreadsheetColumns.forEach(col => {

      if (col.title.toLowerCase() === 'latitude') {
        col.sampleData = parseFloat(col.sampleData).toFixed(8).toString();
        if (!col.sampleData.match(/^(-?[1-8]?\d(?:\.\d{6,8})|90(?:\.0{6,8})?)$/)) {
          this.alertService.error('Latitude value out of valid range (-90.000000 : 90.000000)');
          this.importResult.errors = ['error'];
        }
      }

      if (col.title.toLowerCase() === 'longitude') {
        col.sampleData = parseFloat(col.sampleData).toFixed(8).toString();
        if (!col.sampleData.match(/^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{6,8})|180(?:\.0{6,8})?)$/)) {
          this.alertService.error('Longitude value out of valid range (-180.000000 : 180.000000)');
          this.importResult.errors = ['error'];
        }
      }

      columns.push(new SpreadsheetColumnDto(col.name, col.title, col.sampleData));
    });

    return columns;
  }

  private mapHeaderRow(headerRow: any): HeaderRow {
    return new HeaderRow(headerRow.isCalculated, headerRow.confidence, headerRow.row, this.mapColumnMapping(headerRow.columnMapping));
  }

  private mapColumnMapping(columnMapping: any): Array<ColumnMap> {
    const mappings = new Array<ColumnMap>();

    columnMapping.forEach(element => {
      mappings.push(<ColumnMap>{
        spreadsheetColumn: element.spreadsheetColumn,
        dataTargetFieldId: element.dataTargetField,
        importTemplateColumnId: element.importTemplateColumnId,
      });
    });

    return mappings;
  }

  private mapTargetDescription(dataTargetDescription: any): DataTargetDescription {
    return {
      name: dataTargetDescription.name,
      columns: this.mapDataTargetColumns(dataTargetDescription.columns)
    };
  }

  private mapDataTargetColumns(dataTargetColumns: any): Array<DataTargetField> {
    const columns = new Array<DataTargetField>();
    dataTargetColumns.forEach(element => {
      columns.push({ name: element.name, type: element.type, id: element.id, isCustom: false });
    });

    return columns;
  }

  public getDataCountByGroup(dto: UploadSpreadsheetDto) {
    return this.inventoryApiService.getDataCountByGroup(dto.groupId, dto.dataTargetId);
  }
}
