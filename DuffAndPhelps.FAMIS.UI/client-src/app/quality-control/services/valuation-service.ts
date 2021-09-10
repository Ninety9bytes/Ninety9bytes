import { Injectable } from '@angular/core';
import { Building } from '../../_models/building.model';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { Observable } from 'rxjs';
import { ValuationResponseDto } from '../../_api/_runtime/dtos/building.dto';

@Injectable()
export class ValuationService {
  private selectedBuildings: Building;
  public buildingValuationErrors: ApiServiceResult<EnumDto>;
  public floodPlainValuationErrors: ApiServiceResult<EnumDto>;

  constructor(private insuranceApiService: InsuranceApiService,
              private referenceDataApiService: ReferenceDataApiService) {}

  public submitBuildingValuation(buildingIds: string[]): Observable<Array<ValuationResponseDto>> {
    return this.insuranceApiService.submitBuildingValuation(buildingIds);
  }

  public submitFloodPlainValuation(buildingIds: string[]): Observable<Array<ValuationResponseDto>> {
    return this.insuranceApiService.submitFloodPlainValuation(buildingIds);
  }

  public getBuildingValuationErrorMappings() {
    this.referenceDataApiService.getBuildingValuationErrorTypes().subscribe(errors => {
      this.buildingValuationErrors = errors;
    });
  }

  public getFloodPlainValuationErrorMappings() {
    this.referenceDataApiService.getFloodPlainValuationErrorTypes().subscribe(errors => {
      this.floodPlainValuationErrors = errors;
    });
  }
}
