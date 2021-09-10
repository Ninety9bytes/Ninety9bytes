import { BuildingAttributeDto } from '../_api/_runtime/dtos/building.dto';
import { AttributeTypeOption } from '../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { ModalFormEvent } from '../_enums/modal-form-event';

export interface BuildingAttributeGridItemViewModel {
  attributeType: number;
  attributeTypeName: string;
  attributeValueOptions: Array<AttributeTypeOption>;
  valueName: string;
  selectedValues: Array<BuildingAttributeDto>;
  valueSummary: Array<BuildingAttributeValueViewModel>;
  order: number;
}

export interface BuildingAttributeValueViewModel {
  description: string;
  value: number;
}

export interface BuildingAttributeValueViewModel {
  description: string;
  value: number;
}

export interface BuildingAttributeModalResult {
  action: ModalFormEvent;
  selectedAttributes: Array<BuildingAttributeDto>;
  attributesToDelete: Array<BuildingAttributeDto>;
}
