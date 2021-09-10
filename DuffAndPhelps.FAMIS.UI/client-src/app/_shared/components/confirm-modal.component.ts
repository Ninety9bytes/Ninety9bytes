import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { Component, OnInit, Input } from '@angular/core';
import { ModalProperties } from '../../_models/modal-properties.model';

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm-modal.component.html'
})
export class ConfirmModalComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() options: ModalProperties;

  constructor(
    public activeModal: NgbActiveModal,
    private translateService: TranslationManager
  ) {}

  ngOnInit() {
    this.options.heading.key = this.translateMessage(this.options.heading.key, this.options.heading.params);
    this.options.body.key = this.translateMessage(this.options.body.key, this.options.body.params);

    if (this.options.successText) {
      this.options.successText.key = this.translateMessage(this.options.successText.key, this.options.successText.params);
    }

    if (this.options.dismissText) {
      this.options.dismissText.key = this.translateMessage(this.options.dismissText.key, this.options.dismissText.params);
    }
  }

  private translateMessage(message: string, params?: object) {
    return this.translateService.instant(this.options.translateBaseKey + message, params);
  }
}
