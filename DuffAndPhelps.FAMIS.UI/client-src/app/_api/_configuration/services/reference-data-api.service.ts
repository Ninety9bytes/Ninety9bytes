import { DepreciationTypeDto } from '../dtos/depreciation-method.dto';
import { DepreciationTypeEnum } from '../enums/depreciationType.enum';
import { EnumDto } from '../dtos/enum.dto';
import { AttributeCodeResult } from '../dtos/attribute-code-result.dto';
import { ReferenceBuildingAdditionGroupDto } from '../dtos/reference-building-addition-group.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';
import { ApiServiceResult } from '../../dtos/api-service-result.dto';
import { AttributeTypesAndCodesResult } from '../dtos/attribute-types-and-codes-result.dto';
import { ContentCode } from '../dtos/content-code.dto';

@Injectable()
export class ReferenceDataApiService {
  private configEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  public getDepreciationMethods(onlyEnabled: boolean = true): Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/DepreciationMethod?onlyEnabled=${onlyEnabled}`);
  }

  public getDepreciationConventions(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/DepreciationConvention?onlyEnabled=${onlyEnabled}`);
  }

  public GetRoundingTypes(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/RoundingType?onlyEnabled=${onlyEnabled}`);
  }

  public getActivityCodes(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/ActivityCode?onlyEnabled=${onlyEnabled}`, null, true);
  }

  public getAttributeType(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/AttributeType?onlyEnabled=${onlyEnabled}`);
  }

  public getAttributeCodes(attributeTypeId: number):Observable<AttributeCodeResult> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/AtrributeCode/${attributeTypeId}`);
  }

  public getAttributeTypesAndCodes(onlyEnabled: boolean = true):Observable<ApiServiceResult<Array<AttributeTypesAndCodesResult>>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/AttributeTypesAndCodes?onlyEnabled=${onlyEnabled}`);
  }

  public getContentCodes():Observable<ApiServiceResult<Array<ContentCode>>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/ContentCode`);
  }

  public getBuildingValuationErrorTypes(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/BuildingValuationError?onlyEnabled=${onlyEnabled}`);
  }

  public getFloodPlainValuationErrorTypes(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/FloodPlainValuationError?onlyEnabled=${onlyEnabled}`);
  }

  public getBuildingConditions(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/BuildingCondition?onlyEnabled=${onlyEnabled}`);
  }
  public getBuildingAdditionGroups(onlyEnabled: boolean = true):Observable<ApiServiceResult<Array<ReferenceBuildingAdditionGroupDto>>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/ReferenceBuildingAdditionGroup`);
  }
  public getBuildingPerimeterAdjustmentMethod(onlyEnabled: boolean = true):Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/BuildingPerimeterAdjustmentMethod`);
  }
  public getEntryAlarmOptions():Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/EntryAlarmOptions`);
  }

  public getUnitsOfMeasure():Observable<ApiServiceResult<EnumDto>> {
    return this.apiService.get(`${this.configEndpoint}/ReferenceData/UnitsOfMeasure`);
  }

}
