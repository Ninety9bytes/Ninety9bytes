import { ModuleFieldBaseDto } from './module-field-base.dto';

export interface FamisViewModelDto {
  groupId: string;
  viewName: string;
  fields: ModuleFieldBaseDto[];
}
