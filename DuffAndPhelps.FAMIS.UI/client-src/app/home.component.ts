import { Component, OnInit } from '@angular/core';
import { UserStore } from './_core/user/user.store';
import { SystemPermissionsEnum } from './_core/user/permissions';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { TranslatedComponent } from './_core/i18n/translated-component';
import { TranslationBaseKeys } from './_core/i18n/translation-base-keys';

import * as moment from 'moment';
import { TranslationManager } from './_core/i18n/translation-manager';
import { LeftNavService } from './_core/services/left-nav-service';
import { CountriesApiService } from './_api/_configuration/services/countries-api.service';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  translationsLoaded = false;

  userName: string;

  permissions = SystemPermissionsEnum;

  userHasPermissions = false;

  isBusy = false;

  options = {
    position: ['bottom', 'right'],
    showProgressBar: true,
    pauseOnHover: true,
    clickToClose: true,

    timeOut: 5000,
    lastOnBottom: true
  };

  collapsed = false;

  constructor(
    private userStore: UserStore,
    private translate: TranslationManager,
    private intlService: IntlService,
    private countryService: CountriesApiService,
    private leftNavService: LeftNavService
  ) {}

  ngOnInit() {
    this.userStore.user.subscribe(user => {
      if (user && user.profile) {
        this.userHasPermissions = user.permissions.permissionsGranted.length > 0;
        this.userName = user.getName();

        this.countryService.getCountryLanguage(user.profile.CountryCode).subscribe(countryLanguage => {
          if (countryLanguage) {
            (<CldrIntlService>this.intlService).localeId = countryLanguage.locale;
            moment.locale(countryLanguage.locale);
          }
        });
      }
    });
  }

  logout(): void {
    this.userStore.logoutUser();
  }

  public toggleNavClicked() {
    this.collapsed = !this.collapsed;
    this.leftNavService.toggleCollapsed(this.collapsed);
  }
}
