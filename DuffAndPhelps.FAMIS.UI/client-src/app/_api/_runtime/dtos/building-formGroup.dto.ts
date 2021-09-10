import { FormControl } from '@angular/forms';

export interface BuildingFormGroup {
  id: FormControl;
  buildingAttributeCodeId: FormControl;
  percent?: FormControl;
  storyHeight?: FormControl;
  value?: FormControl;
}
