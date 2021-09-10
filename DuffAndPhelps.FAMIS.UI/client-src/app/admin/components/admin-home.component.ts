import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-home',
  templateUrl: './admin-home.component.html'
})
export class AdminHomeComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.router.navigate(['/admin/users']);
  }

}
