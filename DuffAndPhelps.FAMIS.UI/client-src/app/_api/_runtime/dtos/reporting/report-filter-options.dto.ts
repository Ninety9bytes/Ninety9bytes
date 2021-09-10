export interface ReportFilterOptionsDto {
  filterColumnOptions: FilterColumnOption [];
  filterColumnOperations: FilterColumnOperation [];
}

export interface FilterColumnOption {
  id: string;
  columnName: string;
}

export interface FilterColumnOperation {
  id: string;
  operationName: string;
}

export interface DeliverableRequestDetailDto {
  reportFilters: Array<ReportFilterValueDto>;
  outputType: string;
  fileName: string;
}

export interface ReportFilterValueDto {
  filterColumnId: string;
  filterOperationId: string;
  filterValue: string;
}
