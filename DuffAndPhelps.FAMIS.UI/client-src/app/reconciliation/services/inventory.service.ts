import {map} from 'rxjs/operators';
import { ConsolidationColumn } from '../../_models/reconciliation/consolidation-column.model';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { InventoryService as ReconInventoryService } from '../../_api/services/reconciliation/inventory.service';
import { Observable } from 'rxjs';
import { FieldOption } from '../../_models/field-option.model';
import { AssetFileRecordDto } from '../../_api/dtos/asset-file-record-dto';
import { Asset } from '../../_models/asset.model';
import { ConsolidatedFileColumnMapDto } from '../../_api/dtos/consolidated-file-column-map.dto';
import { AssetFileSummaryDto } from '../../_api/dtos/asset-file-summary.dto';

@Injectable()
export class ReconciliationInventoryService {

  constructor(
    private inventoryService: ReconInventoryService,
    private configService: ConfigService,
    private inventoryApiService: InventoryApiService
  ) {}

  copyInventoryToGroup(sourceGroupId, targetGroupId): Observable<any> {
    return this.inventoryService.copy(sourceGroupId, targetGroupId);
  }

  getGroupDepartmentsOptions(groupId): Observable<Array<FieldOption>> {
    const options: Array<FieldOption> = new Array<FieldOption>();
    return this.inventoryApiService.getDepartmentsByGroupId(groupId).pipe(map(result => {
        result.forEach(department => {
          options.push(<FieldOption>{
            displayName : department.departmentNumber.concat(' - ', department.description),
            key : department.id
          });
        });
        return options;
    }));
  }

  getGroupAccountOptions(groupId): Observable<Array<FieldOption>> {
    const options: Array<FieldOption> = new Array<FieldOption>();
    return this.inventoryApiService.getAccountsByGroupId(groupId).pipe(map(result => {
      result.forEach(account => {
        options.push(<FieldOption>{
          displayName: account.accountNumber.concat(' - ', account.accountDescription),
          key: account.id
        });
      });
      return options;
    }));
  }

  getContractGroupsWithInventory(groupId): Observable<any> {
    return this.inventoryService.getContractGroupsWithInventory(groupId);
  }

  getAssetFileSummary(groupId: string, filetype: number): Observable<AssetFileSummaryDto> {
    return this.inventoryService.getAssetFileSummary(groupId, filetype).pipe(
    map(data => {
      data.fields.sort((a, b) => this.stringComparator(a.name, b.name));
      return data;
    }));
  }

  getAssetFileSearchMetadata(filetype: number): Observable<AssetFileSummaryDto> {
    return this.inventoryService.getAssetFileSearchMetadata(filetype).pipe(
    map(data => {
      data.fields.sort((a, b) => this.stringComparator(a.name, b.name));
      return data;
    }));
  }

  public getSearchMetadataByGroupId(groupId: string, fileType: number): Observable<AssetFileSummaryDto> {
    return this.inventoryApiService.getSearchMetadataByGroupId(groupId, fileType);
  }


  createAssetRecord(fileId: string, recordDto: Object): Observable<AssetFileRecordDto> {
    return this.inventoryService.createAssetRecord(fileId, recordDto).pipe(
    map(asset => {
      asset.id = asset['id'];
      return asset;
    }));
  }

  getAssetRecord(recordId: string): Observable<Asset> {
    return this.inventoryService.getAssetRecord(recordId);
  }

  updateAssetRecord(recordId: string, recordDto: Object): Observable<Asset> {
    return this.inventoryService.updateAssetRecord(recordId, recordDto).pipe(
    map(asset => {
      asset.assetId = asset['id'];
      return asset;
    }));
  }

  public copyAssetRecord(recordId: string): Observable<AssetFileRecordDto> {
    return this.inventoryService.copyAssetRecord(recordId).pipe(
    map(asset => {
      asset.id = asset['id'];
      return asset;
    }));
  }

  public getConsolidatedColumnMappings(groupId: string): Observable<Array<ConsolidatedFileColumnMapDto>> {
    return this.inventoryService.getConsolidatedColumnMappings(groupId).pipe(
    map(result => result.result));
  }

  public updateConsolidatedColumnMappings(groupId: string, mappings: ConsolidationColumn[])
  : Observable<Array<ConsolidatedFileColumnMapDto>> {
    const dto = mappings.map(m => <ConsolidatedFileColumnMapDto> {
      id: m.id,
      source: m.sourceTarget,
      name: m.sourceColumn,
      displayName: m.displayName,
      destinationColumnName: m.destinationColumnName,
      order: 0
    });
    return this.inventoryService.updateConsolidatedColumnMappings(groupId, dto).pipe(
    map(result => result.result));
  }

  private stringComparator(a, b): number {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }
}
