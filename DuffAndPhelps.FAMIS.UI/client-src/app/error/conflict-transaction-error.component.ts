import { Location } from '@angular/common';
import { TranslatedComponent } from '../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'conflict-transaction-error',
  templateUrl: './conflict-transaction-error.component.html'
})
export class ConflictServerErrorComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  constructor(
    private location: Location
  ) { }

  ngOnInit() {}

  backToPrevious() {
    this.location.back();
  }
}
