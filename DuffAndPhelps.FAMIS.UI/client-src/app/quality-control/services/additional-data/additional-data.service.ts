import { HelperService } from '../../../_core/services/helper.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReferenceBuildingAdditionGroupDto } from '../../../_api/_configuration/dtos/reference-building-addition-group.dto';
import { BuildingAdditionField } from '../../../_models/building-addition-view.model';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';

// TODO: Add Additional data recipe at the top
// Consider breaking it up in multiple classes one that manages
@Injectable()
export class AdditionalDataService {
  private buildingAdditionGroupsSource = new BehaviorSubject<Array<ReferenceBuildingAdditionGroupDto>>(
    new Array<ReferenceBuildingAdditionGroupDto>()
  );
  public buildingAdditionGroups$ = this.buildingAdditionGroupsSource.asObservable();

  public flattenedData = new Array<BuildingAdditionField>();

  constructor(private referenceDataApiService: ReferenceDataApiService, private helperService: HelperService) {}

  initBuildingAdditionGroups(): void {
    this.referenceDataApiService.getBuildingAdditionGroups().subscribe(buildingAdditionGroups => {
      const flattend = this.flattenReferenceData(buildingAdditionGroups.result);

      this.flattenedData = flattend;

      this.buildingAdditionGroupsSource.next(buildingAdditionGroups.result);
    });
  }

  private flattenReferenceData(referenceData: ReferenceBuildingAdditionGroupDto[]): BuildingAdditionField[] {
    const result = [];

    referenceData.forEach(group => {
      group.referenceBuildingAdditionCategoryDtos.forEach(category => {
        category.referenceBuildingAdditionCriterionDtos.forEach(criteria => {
          result.push(<BuildingAdditionField>{ groupDto: group, categoryDto: category, criteria: criteria });
        });
      });
    });

    return result;
  }
}
