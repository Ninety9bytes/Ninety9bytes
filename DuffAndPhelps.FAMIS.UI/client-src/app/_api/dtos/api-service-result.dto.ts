export interface ApiServiceResult<T>{
  code: number;
  result: T;
  resultType?: number;
  invalidArguments?: any; // TODO: Add type for this
}
