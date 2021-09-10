import { ProcessingService } from '../../services/processing.service';
import { Injectable } from '@angular/core';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';
import { ViewModelsApiService } from '../../../_api/_runtime/services/view-models-api.service';
import { ApiServiceResult } from '../../../_api/dtos/api-service-result.dto';
import { Observable } from 'rxjs';
import { EnumDto } from '../../../_api/_configuration/dtos/enum.dto';

@Injectable()
export class DepreciationFormService {
  constructor(
    private referenceDataApiService: ReferenceDataApiService,
    private viewModelsApiService: ViewModelsApiService
  ) {}

  public getDepreciationMethods(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getDepreciationMethods();
  }

  public getDepreciationConventions(): Observable<ApiServiceResult<EnumDto>> {
    return this.referenceDataApiService.getDepreciationConventions();
  }

  public getSubProfileFields(groupId: string) {
    return this.viewModelsApiService.getSubProfileForGroup(groupId);
  }

  public getMainProfileFields(groupId: string) {
    return this.viewModelsApiService.getMainProfileForGroup(groupId);
  }
}
