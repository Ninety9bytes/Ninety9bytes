export interface ReferenceBuildingAdditionGroupDto {
  id: string;
  code: number;
  description: string;
  referenceBuildingAdditionCategoryDtos: ReferenceBuildingAdditionCategoryDto[];
}

export interface ReferenceBuildingAdditionCategoryDto {
  id: string;
  code: number;
  description: string;
  referenceBuildingAdditionCriterionDtos: ReferenceBuildingAdditionCriterionDto[];
  referenceBuildingAdditionAdjustmentDtos: ReferenceBuildingAdditionAdjustmentDto[];
}

export interface ReferenceBuildingAdditionAdjustmentDto {
  id: string;
  referenceBuildingAdditionCategoryId: string;
  referenceBuildingAdditionCategoryDto?: any;
  referenceBuildingAdjustmentId: string;
  referenceBuildingAdjustmentDto?: ReferenceBuildingAdjustmentDto;
}

export interface ReferenceBuildingAdjustmentDto {
  id: string;
  code: number;
  description: string;
  referenceBuildingAdditionAdjustmentDtos?: Array<ReferenceBuildingAdditionAdjustmentDto>;
}

export interface ReferenceBuildingAdditionCriterionDto {
  id: string;
  index: number;
  code?: null | number | number;
  description: string;
  hasValueEntry: boolean;
  referenceBuildingAdditionCategoryId: string;
}
export interface ReferenceBuildingAdjustmentDto {
  id: string;
  code: number;
  description: string;
  referenceBuildingAdditionAdjustmentDtos?: Array<ReferenceBuildingAdditionAdjustmentDto>;
}