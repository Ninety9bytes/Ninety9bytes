import { GridColumnHeader } from '../grid-column-header.model';
import { GridSubGridData } from './famis-sub-grid.model';
import { SortDescriptor } from '@progress/kendo-data-query';
import { Observable, Subscription } from 'rxjs';
import { DataTargetName } from '../../_enums/data-target-name';

export interface FamisGrid {
  columnToSelectBy: string;
  fileId: string;
  gridId: number;
  gridData: Observable<Array<any>>; // Usage of Any type is by design as Grid can present a collection of any datatype
  gridSubGridData?: GridSubGridData;
  actions: Array<string>;
  loading: Subscription | boolean;
  cacheLoading: Subscription;
  selectedHeaders: Array<string>;
  columnHeaders: Array<GridColumnHeader>;
  dataSource?: DataTargetName;
  windowSize?: number;
  totalRecordCount: number;
  name: string;
  height: number;
  supportedOperators?: Array<FamisGridFeature>;
  translationBaseKey?: string;
  groupId?: string;
  scrollingMode?: string;
  hideTitle: boolean;
  defaultSort: Array<SortDescriptor>;
}

export enum FamisGridFeature {
  Sort,
  Filter,
  ColumnSelection,
  SingleSelectable,
  MultiSelectable,
  InGridEditable,
  HideTableCounts,
  DashboardGroupSubGrid
}
