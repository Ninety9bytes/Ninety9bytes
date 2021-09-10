import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mass-update-form',
  templateUrl: './mass-update-form.component.html'
})

export class MassUpdateFormComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
