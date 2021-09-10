import { FamisViewModelField } from './famis-view-model-field.dto';

export interface FamisViewModelDto {
  groupId: string;
  viewName: string;
  fields: FamisViewModelField[];
}

