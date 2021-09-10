import { DataTargetField } from './data-target-field.model';

export interface DataTargetDescription {
  name: string;
  columns: Array<DataTargetField>;
}
