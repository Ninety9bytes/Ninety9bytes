import { Injectable } from '@angular/core';
import { NgForm } from '@angular/forms';

@Injectable()
export class CanDeactivateService {
  private confirmDialogText = 'Are you sure? You\'ll lose your changes.';

  canDeactivateForm(currentForm?: NgForm, dirty?: boolean): boolean {
    // TODO: The confirm window should show if form is submitted and has validation errors
    if (dirty || currentForm && currentForm.dirty && currentForm.submitted === false) {
      return confirm(this.confirmDialogText);
    }

    return true;
  }

  canDeactivateComponent(dirty: boolean): boolean {
    if (dirty) {
      return confirm(this.confirmDialogText);
    }

    return true;
  }

  canDeactivateFormAndComponent(currentForm: NgForm, dirty: boolean): boolean {
    if (dirty || (currentForm && currentForm.dirty && currentForm.submitted === false)) {
      return confirm(this.confirmDialogText);
    }
    return true;
  }
}
