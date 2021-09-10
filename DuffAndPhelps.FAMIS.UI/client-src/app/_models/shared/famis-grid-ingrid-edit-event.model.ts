import { BuildingDto } from '../../_api/_runtime/dtos/building.dto';

export interface FamisInGridEditEventResult {
    dataItem: BuildingDto;
    editedField: string;
}
