import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CreateAssetFileCustomColumnDto } from '../../dtos/create-asset-file-custom-column.dto';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { AssetFileRecordDto } from '../../dtos/asset-file-record-dto';
import { Asset } from '../../../_models/asset.model';
import { ConsolidatedFileColumnMapDto } from '../../dtos/consolidated-file-column-map.dto';
import { MatchCodeColumnMapDto } from '../../dtos/reconciliation/match-code-column-map.dto';
import { DataTargetName } from '../../../_enums/data-target-name';
import { AssetSearchDto, AssetSearchResponseDto } from '../../dtos/inventory/asset-search.dto';
import { AssetFileSummaryDto } from '../../dtos/asset-file-summary.dto';
import { ConsolidatedFilePreviewDto } from '../../dtos/consolidated-file-preview.dto';

@Injectable()
export class InventoryService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public copy(sourceGroupId, targetGroupId): Observable<any> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/${sourceGroupId}/CopyGroupInventory/${targetGroupId}`);
  }

  /*public read(groupId: string, type: number, skip: number = 0, take: number = 42): Observable<Asset[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets/${type}?skip=${skip}&count=${take}`);
  }*/

  /*public getInventory(groupId: string, dataTarget: number, filterDto: InventoryFilterDto): Observable<Asset[]> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets/${dataTarget}`, filterDto);
  }*/

  public search(groupId: string, searchFilter: AssetSearchDto): Observable<AssetSearchResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets`, searchFilter, null, true);
  }

  public getContractGroupsWithInventory(groupId): Observable<any> {
    return this.apiService.get(`${this.runtimeEndpoint}/group/${groupId}/ContractGroups/InventoryFiles`);
  }

  public getAssetFileSummary(groupId: string, filetype: number): Observable<AssetFileSummaryDto> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/Inventory/${groupId}/SearchMetadata/${filetype}`, null, true).pipe(
      map(result => <AssetFileSummaryDto>result));
  }

  public getAssetFileSearchMetadata(filetype: number): Observable<AssetFileSummaryDto> {
    return this.apiService.get(
      `${this.runtimeEndpoint}/Inventory/SearchMetadata/${filetype}`
    ).pipe(map(result => <AssetFileSummaryDto>result));
  }

  public addAssetCustomColumns(
    fileId: string,
    columns: CreateAssetFileCustomColumnDto[]
  ): Observable<ApiServiceResult<CreateAssetFileCustomColumnDto[]>> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/Inventory/AssetFiles/${fileId}/CustomColumns`, columns).pipe(
      map(result => <ApiServiceResult<Array<CreateAssetFileCustomColumnDto>>>result));
  }

  public createAssetRecord(fileId: string, recordDto: Object): Observable<AssetFileRecordDto> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/Inventory/AssetFiles/${fileId}/CreateAssetRecord`, recordDto).pipe(
      map(result => <AssetFileRecordDto>result));
  }

  public copyAssetRecord(recordId: string): Observable<AssetFileRecordDto> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/Inventory/CopyAssetRecord/${recordId}`, null).pipe(
      map(result => <AssetFileRecordDto>result));
  }

  public getAssetRecord(recordId: string): Observable<Asset> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${recordId}`).pipe(map(result => <Asset>result));
  }

  public updateAssetRecord(recordId: string, recordDto: Object): Observable<Asset> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/${recordId}`, recordDto, true).pipe(map(result => <Asset>result));
  }

  public getConsolidatedColumnMappings(groupId: string): Observable<ApiServiceResult<Array<ConsolidatedFileColumnMapDto>>> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Group/${groupId}/Mapping`).pipe(
      map(result => <ApiServiceResult<Array<ConsolidatedFileColumnMapDto>>>result));
  }

  public updateConsolidatedColumnMappings(
    groupId: string,
    mappings: Array<ConsolidatedFileColumnMapDto>
  ): Observable<ApiServiceResult<Array<ConsolidatedFileColumnMapDto>>> {
    return this.apiService
      .patch(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Group/${groupId}/Mapping`, mappings).pipe(
      map(result => <ApiServiceResult<Array<ConsolidatedFileColumnMapDto>>>result));
  }

  public getConsolidatedColumnAssignments(groupId: string): Observable<ApiServiceResult<Array<MatchCodeColumnMapDto>>> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Group/${groupId}/MatchCodeColumnMap`).pipe(
      map(result => <ApiServiceResult<Array<MatchCodeColumnMapDto>>>result));
  }

  public updateConsolidatedColumnAssignments(
    groupId: string,
    assignments: Array<MatchCodeColumnMapDto>
  ): Observable<ApiServiceResult<Array<MatchCodeColumnMapDto>>> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Group/${groupId}/MatchCodeColumnMap`, assignments).pipe(
      map(result => <ApiServiceResult<Array<MatchCodeColumnMapDto>>>result));
  }

  public deleteAssetFileById(assetFileId: string): Observable<any> {
    return this.apiService.delete(`${this.runtimeEndpoint}/Inventory/AssetFiles/${assetFileId}`);
  }

  public deleteAssetFileForGroup(groupId: string, dataTarget: DataTargetName): Observable<any> {
    return this.apiService.delete(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets/${dataTarget}`);
  }

  public getConsolidatedFilePreview(groupId: string, handleLocalError?: boolean): 
  Observable<ApiServiceResult<Array<ConsolidatedFilePreviewDto>>> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Preview/Group/${groupId}`, null, handleLocalError).pipe(
      map(result => <ApiServiceResult<Array<ConsolidatedFilePreviewDto>>>result));
  }

  public createConsolidatedFile(groupId: string): Observable<string> {
    return this.apiService.patch(`${this.runtimeEndpoint}/Inventory/ConsolidatedFile/Create/${groupId}`);
  }
}
