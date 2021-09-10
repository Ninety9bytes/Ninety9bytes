export interface DuplicateCheckResponseDto {
  field: string;
  totalRecords: number;
  results: DuplicateCheckResult[];
}

export interface DuplicateCheckResult {
  fieldValue: string;
  count: number;
}
