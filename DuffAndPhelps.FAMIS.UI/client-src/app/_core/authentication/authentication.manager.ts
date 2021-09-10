import { MsalConfig } from './msal-config.model';
import { HttpError } from '../network/http-error.model';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { UserAgentApplication } from 'adal-angular';
export enum LoginType {
  adal,
  msal
}
export enum StorageKey {
  lastLoginType
}

const AdalAuthenticationContext = AuthenticationContext;

@Injectable()
export class AuthenticationManager {
  private _hasAdalAuth = new BehaviorSubject<boolean | undefined>(undefined);
  private _hasMsalAuth = new BehaviorSubject<boolean | undefined>(undefined);
  private _hasAnyAuth = new BehaviorSubject<boolean | undefined>(undefined);
  private _error = new BehaviorSubject<HttpError | undefined>(undefined);
  private _lastLoginType = new BehaviorSubject<LoginType | undefined>(undefined);
  private _hasToken = new BehaviorSubject<boolean | undefined>(undefined);

  private defaultAdditionalExpireOffsetSeconds = 600;
  private adalConfig: adal.Config = {
    tenant: environment.adalTennant,
    clientId: environment.adalClientId,
    expireOffsetSeconds: environment.adalExpireOffsetSeconds,
    redirectUri: window.location.origin + '/',
    postLogoutRedirectUri: window.location.origin + '/',
    endpoints: environment.adalEndpoints,
    navigateToLoginRequestUrl: false
  };
  private msalConfig: MsalConfig = {
    authority:
    `https://login.microsoftonline.com/tfp/${environment.msalTenant}.onmicrosoft.com/` + `${environment.msalSigninSignupPolicy}`,
    clientId: environment.msalClient,
    scopes: [environment.msalScope]
  };

  private adalContext: adal.AuthenticationContext = new AdalAuthenticationContext(this.adalConfig);
  private msalContext?: UserAgentApplication;

  public hasAdalAuth = this._hasAdalAuth.asObservable();
  public hasMsalAuth = this._hasMsalAuth.asObservable();
  public hasAnyAuth = this._hasAnyAuth.asObservable();
  public hasToken = this._hasToken.asObservable();
  public error = this._error.asObservable();
  public lastLoginType = this._lastLoginType.asObservable();
  public hasAuthError = false;

  public getAdditionalOffsetFromConfig(): number{
    const retrievedTIme = environment.additionalExpireOffsetSeconds;
    return retrievedTIme ? retrievedTIme : this.defaultAdditionalExpireOffsetSeconds;
  }

  public getAdalConfig(): adal.Config {
    return this.adalConfig;
  }

  public getAdalContext(): adal.AuthenticationContext {
    return this.adalContext;
  }



  public processAdalToken(): void {
    this.adalContext.handleWindowCallback();
    this.findAdalAuth();

    const storedLoginType: any = sessionStorage.getItem(StorageKey[StorageKey.lastLoginType]);
    if (storedLoginType) {
      const lastLoginType: any = LoginType[storedLoginType];
      this._lastLoginType.next(lastLoginType);
    }
  }

  public initMsal(): void {
    this.msalContext = new UserAgentApplication(
      this.msalConfig.clientId,
      this.msalConfig.authority,
      (errorDesc, token, error, tokenType) => {
        if (error) {
          return;
        }
        if (sessionStorage.getItem('msal.idtoken')) {
          this._hasMsalAuth.next(true);
        }
      },
      {
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin
      }
    );
    this.findMsalAuth();
  }

  public loginAdal(): void {
    this.adalContext.login();
   }

  public loginMsal(): void {
    if (this.msalContext === undefined) {
      throw new Error('msal.js was never initiatlized');
    }

    this.msalContext.loginRedirect(this.msalConfig.scopes);
  }

  public logoutAdal(): void {
    if (this._hasAdalAuth.getValue()) {
      this.adalContext.logOut();
    }
  }

  public logoutMsal(): void {
    if (this.msalContext && this._hasMsalAuth.getValue()) {
      this.msalContext.logout();
    }
  }

  // TODO: Improve this
  public forgetAdal(): void {
    sessionStorage.removeItem('adal.idtoken');
    sessionStorage.removeItem('adal.error');
    sessionStorage.removeItem('adal.error.description');
    sessionStorage.removeItem('adal.login.error');
    sessionStorage.removeItem('adal.login.request');
    sessionStorage.removeItem('adal.nonce.idtoken');
    sessionStorage.removeItem('adal.session.state');
    sessionStorage.removeItem('adal.state.login');
    sessionStorage.removeItem('adal.token.keys');
    this._hasAdalAuth.next(false);
  }

  // TODO: Improve this
  public forgetMsal(): void {
    sessionStorage.removeItem('msal.idtoken');
    sessionStorage.removeItem('msal.client.info');
    sessionStorage.removeItem('msal.error');
    sessionStorage.removeItem('msal.error.description');
    sessionStorage.removeItem('msal.login.error');
    sessionStorage.removeItem('msal.login.request');
    sessionStorage.removeItem('msal.nonce.idtoken');
    sessionStorage.removeItem('msal.state.login');
    sessionStorage.removeItem('msal.idtoken');
    this._hasMsalAuth.next(false);
  }

  public forgetLoginType(): void {
    sessionStorage.removeItem('lastLoginType');
  }

  public getToken(forceRenewal = false, expirationEpoch?: number): Observable<string> {
    if (forceRenewal === true) {
       // configurable additional buffer
      this.adalContext.config.expireOffsetSeconds +=
        expirationEpoch - (((new Date()).getTime() / 1000) + this.adalContext.config.expireOffsetSeconds) + 1;
    }

    if (this._hasMsalAuth.getValue() && sessionStorage.getItem('msal.idtoken')) {
      const msalResultToekn = this.getMsalToken();
      if (forceRenewal === true) {
        this.adalContext.config.expireOffsetSeconds = environment.adalExpireOffsetSeconds;
      }
      this._hasToken.next(true);
      return msalResultToekn;
    }

    const result = this.getAdalToken();
    if (forceRenewal === true) {
      this.adalContext.config.expireOffsetSeconds = environment.adalExpireOffsetSeconds;
    }
    this._hasToken.next(true);
    return result;
  }

  public handleAuthenticationError(error: HttpError): void {
    this._error.next(error);
    setTimeout(() => {
      this.forgetAdal();
      this.forgetMsal();
      if(error && error.status == 403)
        this.hasAuthError = true;
    });
  }

  private getAdalToken(): Observable<string> {
    const result = new Subject<string>();
    const tokenWeWillUse = sessionStorage.getItem('adal.idtoken');

    const tokenCallback = (message: string, token: string) => {
      setTimeout(() => {
        if (token) {
          result.next(token);
          result.complete();
        } else {
          // console.log(`Token was supposedly null. Was it? Token: ${tokenWeWillUse}.`);
          result.next(tokenWeWillUse || '');
          result.complete();
        }
      });
    };

    this.adalContext.acquireToken(this.adalConfig.clientId, tokenCallback);

    return result.asObservable();
  }

  private getMsalToken(): Observable<string> {
    const result = new Subject<string>();
    // The token returned by the various acquireToken methods is not quite the same
    //  as the token in session storage (one or two fields in the JWT token are different).
    if (this.msalContext === undefined) {
      throw new Error('msal.js was never initiatlized');
    }

    this.msalContext.acquireTokenSilent(this.msalConfig.scopes, undefined).then((token: string) => {
      //
      result.next(sessionStorage.getItem('msal.idtoken') || undefined);
      result.complete();
    });

    return result.asObservable();
  }

  private findAdalAuth(): void {
    if (this._hasMsalAuth.getValue() === true) {
      return;
    }

    const token = this.adalContext.getCachedToken(this.adalConfig.clientId);

    if (token) {
      this.setHasAnyAuth();
      this._hasAdalAuth.next(true);
      sessionStorage.setItem(StorageKey[StorageKey.lastLoginType], LoginType[LoginType.adal]);
    } else {
      this._hasAdalAuth.next(false);
    }

    this.setHasAnyAuth();
  }

  private findMsalAuth(): void {
    const token = sessionStorage.getItem('msal.idtoken');

    if (token) {
      this._hasMsalAuth.next(true);
      sessionStorage.setItem(StorageKey[StorageKey.lastLoginType], LoginType[LoginType.msal]);
    } else {
      this._hasMsalAuth.next(false);
    }

    this.setHasAnyAuth();
  }

  private setHasAnyAuth(): void {
    if (this._hasAdalAuth.getValue() === true || this._hasMsalAuth.getValue() === true) {
      this._hasAnyAuth.next(true);
    }

    if (!this._hasAdalAuth.getValue() && !this._hasMsalAuth.getValue()) {
      this._hasAnyAuth.next(false);
    }
  }
}
