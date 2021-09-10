export enum TransactionValidationStatus {
  NoErrors,
  NegativeCostOrAccumulation,
  DepGtCost, // Depreciation is greater than cost
  InvalidFiscalYearEnd,
  HistCostOrAccumDeprCannotBeZero, // HistoricalCost Or AccumulatedDepreciation cannot be zero when prorate is checked
}
