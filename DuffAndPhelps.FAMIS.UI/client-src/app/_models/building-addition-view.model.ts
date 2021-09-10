import { BuildingSelectedAddition } from '../_api/_runtime/dtos/building.dto';
import { ModalFormEvent } from '../_enums/modal-form-event';
import {
  ReferenceBuildingAdjustmentDto,
  ReferenceBuildingAdditionCategoryDto,
  ReferenceBuildingAdditionGroupDto,
  ReferenceBuildingAdditionCriterionDto,
} from '../_api/_configuration/dtos/reference-building-addition-group.dto';

export interface BuildingAdditionViewModel {
  id: string;
  groupDescription: string;
  categoryCode: number;
  categoryDescription: string;
  childCriterionAdditionId: string;
  criteriaSummary: Array<BuildingAdditionValueSummary>;
  adjustmentSummary: Array<BuildingAdditionValueSummary>;
  totalCost: string;
  quantity: number;
}

export interface BuildingAdditionValueSummary {
  id: string;
  description: string;
  value?: any;
  totalCost?: any;
}

export interface BuildingAdditionField {
  categoryDto: ReferenceBuildingAdditionCategoryDto;
  groupDto: ReferenceBuildingAdditionGroupDto;
  criteria?: ReferenceBuildingAdditionCriterionDto;
  adjustment?: ReferenceBuildingAdjustmentDto;
  quantity: number;
}

export interface BuildingAdditionFormResult {
  action: ModalFormEvent;
  criterion: BuildingSelectedAddition[];
  criteriaToDelete: BuildingSelectedAddition[];
  quantity: number;
}

