import { ImportTemplateDto } from '../../dtos/data-import/import-template.dto';

import { ApiService } from '../api.service';
import { ImportSpreadsheetDto } from '../../dtos/import-spreadsheet.dto';
import { SupportedCustomColumnDataTypeDto } from '../../dtos/shared/supported-custom-column-datatype.dto';
import { UploadSpreadsheetDto } from '../../dtos/upload-spreadsheet.dto';
import { ExcelSummaryDto } from '../../dtos/excel-summary.dto';
import { ImportResultDto } from '../../dtos/import-result.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { ImportMode } from '../../../_enums/import-mode';
import { ColumnMap } from '../../../_models/column-map.model';

@Injectable()
export class DataImportRepository {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  getReviewData(dto: ImportSpreadsheetDto): Observable<any> {
    const spreadsheetMappings = new Array<any>();

    dto.mapping.SpreadsheetMappings.forEach(item => {
      if (item.importTemplateColumnId) {
        spreadsheetMappings.push({
          SpreadsheetColumn: item.spreadsheetColumn.name,
          DataTargetField: item.dataTargetField,
          ImportTemplateColumnId: item.importTemplateColumnId,
          IsCustom: item.isCustom,
          DataType: item.columnDataType
        });
      }
    });

    const spreadsheetMappingDto = {
      Mode: dto.mapping.Mode,
      SpreadsheetMappings: spreadsheetMappings,
      UniqueIdentifierColumn: null
    };

    if (dto.mapping.Mode === ImportMode.AddOrUpdate) {
      spreadsheetMappingDto.UniqueIdentifierColumn = {
        SpreadsheetColumn: dto.mapping.UniqueIdentifierColumn.spreadsheetColumn.name,
        DataTargetField: dto.mapping.UniqueIdentifierColumn.dataTargetField,
        ImportTemplateColumnId: dto.mapping.UniqueIdentifierColumn.importTemplateColumnId,
        IsCustom: dto.mapping.UniqueIdentifierColumn.isCustom,
        DataType: dto.mapping.UniqueIdentifierColumn.columnDataType
      };
    }

    return this.apiService.post(
      `${this.runtimeEndpoint}/Inventory/AssetFiles/Preview?id=${dto.id}&clientId=1&groupId=${dto.groupId}&importTemplateId=${
        dto.importTemplateId
      }&rows=${dto.rows}`,
      spreadsheetMappingDto, null, true
    );
  }

  getDataTargets(): Observable<ImportTemplateDto[]> {
    return this.apiService.get(`${this.configurationEndpoint}/ImportTemplates/FAMIS`);
  }

  getDataTargetsForGroup(grougId: string): Observable<ImportTemplateDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/ImportTemplates/${grougId}/GroupImportTemplates?isPortal=${false}`);
  }

  getCustomColumnDataTypes(): Observable<SupportedCustomColumnDataTypeDto[]> {
    return this.apiService.get(`${this.configurationEndpoint}/ImportTemplates/CustomColumns/DataTypes`);
  }

  getCustomColumns(groupId: string, dataTargetName: string): Observable<Array<ColumnMap>> {
    return this.apiService
    .get(`${this.runtimeEndpoint}/Inventory/AssetFiles/ExistingCustomColumnMaps?groupId=${groupId}&dataTarget=${dataTargetName}`);
  }

  uploadSpreadsheet(dto: UploadSpreadsheetDto, importTemplateId: string): Observable<ExcelSummaryDto> {
    return this.apiService.post(
      `${this.runtimeEndpoint}/Inventory/AssetFiles/Upload?groupId=${dto.groupId}&importTemplateId=${importTemplateId}`,
      dto,
      dto.file
    , true);
  }

  importSpreadsheet(dto: ImportSpreadsheetDto): Observable<ImportResultDto> {
    const spreadsheetMappings = new Array<any>();

    dto.mapping.SpreadsheetMappings.forEach(item => {
      if (item.importTemplateColumnId) {
        spreadsheetMappings.push({
          SpreadsheetColumn: item.spreadsheetColumn.name,
          DataTargetField: item.dataTargetField,
          ImportTemplateColumnId: item.importTemplateColumnId,
          IsCustom: item.isCustom,
          DataType: item.columnDataType
        });
      }
    });

    const spreadsheetMappingDto = {
      Mode: dto.mapping.Mode,
      SpreadsheetMappings: spreadsheetMappings,
      UniqueIdentifierColumn: null
    };

    if (dto.mapping.Mode === ImportMode.AddOrUpdate) {
      spreadsheetMappingDto.UniqueIdentifierColumn = {
        SpreadsheetColumn: dto.mapping.UniqueIdentifierColumn.spreadsheetColumn.name,
        DataTargetField: dto.mapping.UniqueIdentifierColumn.dataTargetField,
        ImportTemplateColumnId: dto.mapping.UniqueIdentifierColumn.importTemplateColumnId,
        IsCustom: dto.mapping.UniqueIdentifierColumn.isCustom,
        DataType: dto.mapping.UniqueIdentifierColumn.columnDataType
      };
    }

    return this.apiService.patch(
      `${this.runtimeEndpoint}/inventory/assetfiles/complete?id=${dto.id}&groupId=${dto.groupId}&importTemplateId=${
        dto.importTemplateId
      }&rows=${dto.rows}`,
      spreadsheetMappingDto
    );
  }
}
