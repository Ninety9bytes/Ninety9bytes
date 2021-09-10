export interface DepartmentDto {
    id: string;
    departmentNumber: string;
    description: string;
}


export interface DepartmentResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    departments: DepartmentDto[];
  }