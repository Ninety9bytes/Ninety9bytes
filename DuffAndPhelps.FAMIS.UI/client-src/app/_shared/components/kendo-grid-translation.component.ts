import { Component, OnInit } from '@angular/core';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';

@Component({
  selector: 'kendo-grid-translation',
  templateUrl: './kendo-grid-translation.component.html'
})
export class KendoGridTranslationComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  constructor() { }

  ngOnInit() {
  }

}
