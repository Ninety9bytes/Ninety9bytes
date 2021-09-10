import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BuildingDto } from '../../_api/_runtime/dtos/building.dto';
import { FieldOption } from '../../_models/field-option.model';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';

@Injectable()
export class BuildingsService {
  private buildingRequestSource = new BehaviorSubject<BuildingDto>(<BuildingDto>{});
  public buildingRequest$ = this.buildingRequestSource.asObservable();

  private attributeOptionsSource =
  new BehaviorSubject<Array<Array<FieldOption>>>(new Array<Array<FieldOption>>());

  public attributeOptions$ = this.attributeOptionsSource.asObservable();

  constructor(private insuranceApiService: InsuranceApiService) { }

  createBuilding(buildingDto: BuildingDto, groupId: string): Observable<BuildingDto> {
    return this.insuranceApiService.createBuilding(groupId, buildingDto, true);
  }

  updateBuilding(id: string, buildingDto: BuildingDto): Observable<BuildingDto> {
    if (buildingDto.siteId && buildingDto.siteId.indexOf(',') > 0) {
      buildingDto.siteId = buildingDto.siteId.split(',')[1];
    }
    return this.insuranceApiService.updateBuilding(id, buildingDto, true);
  }

  getBuilding(buildingId: string): Observable<BuildingDto> {
    return this.insuranceApiService.getBuilding(buildingId);
  }

  setBuildingRequestSource(dto: BuildingDto) {
    this.buildingRequestSource.next(dto);
  }

  public updateOptions(id: number, options: Array<CascadedSelectOption>) {
    const current = this.attributeOptionsSource.getValue();

    current[id] = options;

    this.attributeOptionsSource.next(current);
  }
}
