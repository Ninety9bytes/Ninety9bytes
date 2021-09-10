import { CascadedSelectValue } from './cascaded-select-value.model';
import { CascadedSelectOption } from './cascaded-select-option.model';

export interface CascadedSelectControl {
  defaultValues: Array<string>;
  valuesToSelect: Array<CascadedSelectValue>;
  options: Array<CascadedSelectOption>;
}

