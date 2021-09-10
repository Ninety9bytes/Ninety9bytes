import { ModalFormEvent } from '../_enums/modal-form-event';
import { OccupancyCodeDto } from '../_api/_runtime/dtos/building.dto';
export interface OccupancyCodeGridItemModel {
  id: string;

  description: string;
  storyHeight: number;
  percent: number;
}

export interface OccupancyCodeModalResult {
  action: ModalFormEvent;
  occupancyCode: OccupancyCodeDto;
}
