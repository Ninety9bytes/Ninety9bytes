import { User, UserType } from './user';
import { AuthenticationManager, LoginType } from '../authentication/authentication.manager';
import { Subscriber } from '../subscriber-entity';
import { Permissions } from './permissions';

import * as moment from 'moment';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { zip, BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AccountApiService } from '../../_api/_authorization/services/account-api.service';
import { AuthorizationApiService } from '../../_api/_authorization/services/authorization-api.service';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { TranslateService } from '@ngx-translate/core';
import { CountriesApiService } from '../../_api/_configuration/services/countries-api.service';

@Injectable()
export class UserStore extends Subscriber {
  private _lastLoginType = new BehaviorSubject<UserType | undefined>(undefined);
  private _user = new BehaviorSubject<User | undefined>(undefined);

  public user = this._user.asObservable();
  public lastLoginType = this._lastLoginType.asObservable();

  constructor(
    private authenticationManager: AuthenticationManager,
    private accountService: AccountApiService,
    private authorizationService: AuthorizationApiService,
    private referenceDataService: ReferenceDataApiService,
    private translate: TranslateService,
    private intlService: IntlService,
    private countryService: CountriesApiService
  ) {
    super();
  }

  public hasAnyAuth(): Observable<boolean> {
    return this.authenticationManager.hasAnyAuth;
  }

  public initializeAuthentication(): void {
    this.subscribeDefined(this.authenticationManager.hasAnyAuth, hasAnyAuth => {
      this.subscribe(this.authenticationManager.lastLoginType, lastLoginType => {
        this.findUser(<LoginType> lastLoginType, <boolean> hasAnyAuth);
        if (lastLoginType === LoginType.adal) {
          this._lastLoginType.next(UserType.Employee);
        } else if (lastLoginType === LoginType.msal) {
          this._lastLoginType.next(UserType.Consumer);
        }
      });
    });
  }

  private findUser(lastLoginType?: LoginType, hasAnyAuth?: boolean) {
    const userType = lastLoginType === LoginType.adal ? UserType.Employee : UserType.Consumer;

    if (hasAnyAuth === false) {
      this._user.next(new User(userType));
    }

    if (hasAnyAuth === true) {
      const request = zip(this.accountService.read(), this.authorizationService.read());

      this.subscribe(request, data => {
        const profile = data[0];
        const authorization = data[1];


        this.countryService.getCountryLanguage(profile.CountryCode).subscribe(countryLanguage => {
          if (countryLanguage) {

            this.translate.use(countryLanguage.languageId);

            (<CldrIntlService>this.intlService).localeId = countryLanguage.locale;
            moment.locale(countryLanguage.locale);

            this._user.next(
              new User(userType, profile, new Permissions(authorization),
              countryLanguage.languageId, countryLanguage.locale, profile.IsActive)
            );
          }
        });
      });
    }
  }

  public loginUser(): void {
    sessionStorage.setItem('user-current-url', window.location.pathname);

    this.authenticationManager.loginAdal();
  }

  public logoutUser(): void {
    this.authenticationManager.forgetLoginType();
    this.subscribeDefined(this.authenticationManager.hasAdalAuth, () => {
      this.authenticationManager.forgetAdal();
      window.location.href = '/';
    });
  }
}
