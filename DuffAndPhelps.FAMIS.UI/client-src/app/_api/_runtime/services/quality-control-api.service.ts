import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { DuplicateCheckRequestDto } from '../dtos/duplicate-check.dto';
import { DuplicateCheckResponseDto } from '../dtos/duplicate-check-response.dto';
import { Observable } from 'rxjs';
import { MassUpdateRequestDto } from '../dtos/mass-update-request.dto';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { QualityControlMassUpdateResponseDto } from '../dtos/quality-control-mass-update-response.dto';
import { QualityControlStatusDto } from '../dtos/quality-control-status.dto';

@Injectable()
export class QualityControlApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public duplicateCheck(
    groupId: string,
    request: DuplicateCheckRequestDto,
    field: string = 'description'
  ): Observable<DuplicateCheckResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/QualityControl/${groupId}/Duplicates`, request).pipe(map(e => e.entity));
  }

  public executeMassContentUpdate(
    groupId: string,
    request: MassUpdateRequestDto
  ): Observable<ApiServiceResult<QualityControlMassUpdateResponseDto>> {
    return this.apiService.post(`${this.runtimeEndpoint}/QualityControl/${groupId}/MassUpdate`, request);
  }
  public executeMassBuildingsUpdate(
    groupId: string,
    request: MassUpdateRequestDto
  ): Observable<ApiServiceResult<QualityControlMassUpdateResponseDto>> {
    return this.apiService.post(`${this.runtimeEndpoint}/QualityControl/${groupId}/BuildingMassUpdate`, request);
  }

  public getStatus(groupId: string): Observable<QualityControlStatusDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/QualityControl/${groupId}/Status`);
  }

  public calculateContentCostReproductionNew(
    contentCode: string,
    contentQuality: number,
    floorArea: number,
    localErrorHandling: boolean = true
  ): Observable<ApiServiceResult<string>> {
    return this.apiService.get(
      `${
        this.runtimeEndpoint
      }/QualityControl/ContentCRN?contentCode=${contentCode}&contentQuality=${contentQuality}&floorArea=${floorArea}`,
      null,
      localErrorHandling
    );
  }

  public calculateBasementFloorArea(
    basementFinishedArea: number,
    basementUnfinishedArea: number,
  ): Observable<ApiServiceResult<string>> {
    return this.apiService.get(
      `${
        this.runtimeEndpoint
      }/QualityControl/BasementFloorArea?basementFinishedArea=${basementFinishedArea}&basementUnfinishedArea=${basementUnfinishedArea}`);
  }
}
