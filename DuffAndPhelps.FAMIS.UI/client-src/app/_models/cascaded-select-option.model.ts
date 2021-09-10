export interface CascadedSelectOption {
  key: string;
  displayName: string;
  options: Array<CascadedSelectOption>;
}