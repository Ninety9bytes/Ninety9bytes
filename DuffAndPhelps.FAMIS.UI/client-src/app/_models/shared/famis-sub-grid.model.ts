import { GridColumnHeader } from '../grid-column-header.model';

export interface GridSubGridData {
  subGridData: any[]; // Usage of Any type is by design as sub grid can present a collection of any datatype.
  subGridHeaders: Array<GridColumnHeader>;
}
