import { FormAction } from '../_enums/form-action';
import { FormGroup, NgForm } from '@angular/forms';

export interface FormActionEvent {
  action: FormAction;
  formGroup?: FormGroup;
  form?: NgForm;
  dto?: any;
}
