import { HelperService } from '../../../_core/services/helper.service';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BuildingDto, BuildingSelectedAddition } from '../../../_api/_runtime/dtos/building.dto';
import { BuildingAdditionField, BuildingAdditionViewModel,
  BuildingAdditionValueSummary } from '../../../_models/building-addition-view.model';
import { ReferenceDataApiService } from '../../../_api/_configuration/services/reference-data-api.service';

@Injectable()
export class AdditionalDataGridService {
  private currentBuilding: BuildingDto;
  private buildingAdditionFields: Array<BuildingAdditionField>;

  constructor(private referenceDataApiService: ReferenceDataApiService,
    private helperService: HelperService) { }

  public initBuildingAdditionGrid(
    building: BuildingDto,
    referenceData: Array<BuildingAdditionField>
  ): Observable<Array<BuildingAdditionViewModel>> {
    this.currentBuilding = building;
    this.buildingAdditionFields = referenceData;

    const buildingAdditionViews = new Array<BuildingAdditionViewModel>();

    if (building && building.buildingSelectedAdditions) {
      building.buildingSelectedAdditions.forEach(addition => {
        const referenceCriteria = referenceData.find(c => c.criteria.id === addition.referenceBuildingAdditionCriterionId);

        if (referenceCriteria && !this.isAdditionChild(addition)) {
          const vm = <BuildingAdditionViewModel>{};
          vm.totalCost = addition.totalCost;
          vm.quantity = addition.quantity;
          vm.id = addition.id;
          vm.groupDescription = referenceCriteria.groupDto.description;
          vm.categoryDescription = referenceCriteria.categoryDto.description;
          vm.categoryCode = referenceCriteria.categoryDto.code;
          vm.criteriaSummary = this.getCriteriaSummary(addition);
          vm.adjustmentSummary = this.getAdjustmentSummary(addition);
          if (addition.childAdditionCriterionId) {
            vm.childCriterionAdditionId = addition.childAdditionCriterionId;
          }
          buildingAdditionViews.push(vm);
        }
      });
    }


    return of(buildingAdditionViews);
  }

  private isAdditionChild(addition: BuildingSelectedAddition) {
    const isChild = this.currentBuilding.buildingSelectedAdditions.findIndex(c => c.childAdditionCriterionId === addition.id) !== -1;

    return isChild;
  }

  private getAdjustmentSummary(addition: BuildingSelectedAddition): BuildingAdditionValueSummary[] {
    const adjustmentSummary = new Array<BuildingAdditionValueSummary>();

    if (addition.buildingSelectedAdjustments) {
      addition.buildingSelectedAdjustments.forEach(a => {
        const selectedCriteria = this.buildingAdditionFields.find(c => c.criteria.id === addition.referenceBuildingAdditionCriterionId);

        console.log(a, 'Adjustment');

        const adjustmentsforCategory = selectedCriteria.categoryDto.referenceBuildingAdditionAdjustmentDtos;

        console.log(adjustmentsforCategory, 'Adjustments for Category');


        adjustmentSummary.push(<BuildingAdditionValueSummary>{
          id: a.id,
          criteriaId: a.referenceBuildingAdditionAdjustmentId,
          description: adjustmentsforCategory.
          find(c => c.id === a.referenceBuildingAdditionAdjustmentId).referenceBuildingAdjustmentDto.description,
          value: a.value,
          totalCost: addition.totalCost
        });

      });
    }

    return adjustmentSummary;
  }

  private getCriteriaSummary(addition: BuildingSelectedAddition): BuildingAdditionValueSummary[] {
    let currentAddition = addition;

    const criteriaSummary = new Array<BuildingAdditionValueSummary>();
    let selectedCriteria = this.buildingAdditionFields.find(c => c.criteria.id === addition.referenceBuildingAdditionCriterionId);

    let vm = <BuildingAdditionValueSummary>{
      id: addition.id,
      criteriaId: addition.referenceBuildingAdditionCriterionId,
      description: selectedCriteria.criteria.description ? selectedCriteria.criteria.description : '',
      value: addition.criterionValue,
      totalCost: addition.totalCost
    };

    criteriaSummary.push(vm);

    currentAddition = this.getAdditionById(addition.childAdditionCriterionId);

    while (currentAddition) {
      selectedCriteria = this.buildingAdditionFields.find(c => c.criteria.id === currentAddition.referenceBuildingAdditionCriterionId);

      vm = <BuildingAdditionValueSummary>{
        id: currentAddition.id,
        criteriaId: currentAddition.referenceBuildingAdditionCriterionId,
        description: selectedCriteria.criteria.description,
        value: currentAddition.criterionValue,
        totalCost: addition.totalCost
      };

      criteriaSummary.push(vm);

      currentAddition = this.getAdditionById(currentAddition.childAdditionCriterionId);
    }

    return criteriaSummary;
  }

  public getAdditionById(id): BuildingSelectedAddition {
    return this.currentBuilding.buildingSelectedAdditions.find(c => c.id === id);
  }
}
