import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'confirm',
  templateUrl: './confirm.component.html'
})
// TODO add translations to confirm for delete action
export class ConfirmComponent implements TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() confirmHeading: string;
  @Input() confirmationMessage: string;
  @Output() isConfirmed = new EventEmitter<boolean>();

  constructor() {}

  public onConfirmed() {
    this.isConfirmed.emit(true);
  }

  public onCancel() {
    this.isConfirmed.emit(false);
  }
}
