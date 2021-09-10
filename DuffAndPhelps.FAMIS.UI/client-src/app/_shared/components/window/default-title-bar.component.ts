import { TemplateRef, OnInit, Component, Input, ViewChild } from '@angular/core';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';

@Component({
  selector: 'default-title-bar',
  templateUrl: './default-title-bar.component.html'
})
export class DefaultTitleBarComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() translationkey = undefined;
  @Input() title = '';

  @ViewChild('windowTitleBar', { static: false })
  windowTitleBar: TemplateRef<any>;

  constructor() {}

  ngOnInit() {
    if (this.translationkey === undefined) {
      this.translationkey = this.i18n.common;
    }
  }
}
