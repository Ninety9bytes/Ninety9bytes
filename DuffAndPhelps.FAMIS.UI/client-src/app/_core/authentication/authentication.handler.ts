import { environment } from '../../../environments/environment';
import {UserAgentApplication} from 'adal-angular';
// Note: this is a pure TypeScript Class no access to Angular yet

// This is necessary for "window.opener" within workaround for msal.js issue 189 and TypeScript compile successfully
declare var window: any; // TODO:  Instead of Any consider interface to extend DOM Window?

const AdalAuthenticationContext = AuthenticationContext;

export class AuthenticationHandler {
  public handleAuthentication(): boolean {
   // return this.handleMsalAuthentication() || this.handleAdalAuthentication();
   return this.handleAdalAuthentication();
  }

  public handleAdalAuthentication(): boolean {
    const isAdalTokenFrame: boolean = window.self !== window.top && window.frameElement.id === 'adalIdTokenFrame';

    if (isAdalTokenFrame) {
      const adalConfig = {
        tenant: environment.adalTennant,
        clientId: environment.adalClientId,
        expireOffsetSeconds: environment.adalExpireOffsetSeconds,
        redirectUri: window.location.origin + '/',
        postLogoutRedirectUri: window.location.origin + '/',
        endpoints: environment.adalEndpoints,
        navigateToLoginRequestUrl: false
      };

      const context = new AdalAuthenticationContext(adalConfig);

      context.handleWindowCallback();

      return true;
    } else {
      return false;
    }
  }

  public handleMsalAuthentication(): boolean {
    this.cleanupWindowOpener();

    const loginStateId: string | null = sessionStorage.getItem('msal.state.login');
    const urlParams = this.getJsonFromUrl(window.location.hash.replace('#', ''));

    const isMsalForgotPassword: boolean = window.location.href.indexOf('AADB2C90118') > -1;
    const isMsalLogin: boolean = urlParams['state'] && urlParams['state'] === loginStateId;
    const isMsalChangedPassword: boolean = document.referrer.indexOf(environment.msalResetPasswordPolicy) > -1;
    const isMsalRenewFrame: boolean = window.self !== window.top && window.frameElement.id.indexOf('msalRenewFrame') > -1;

    if (isMsalForgotPassword) {
      this.handleMsalForgotPassword();
    } else if (isMsalLogin || isMsalRenewFrame) {
      this.handleMsalLogin();
    } else if (isMsalChangedPassword) {
      this.handleMsalPasswordChange();
    } else {
      return false;
    }

    return true;
  }

  // Workaround for msal.js issue 189 https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/189
  private cleanupWindowOpener(): void {
    try {
      return window.opener && window.opener.msal;
    } catch (err) {
      // err = SecurityError: Blocked a frame with origin "[url]" from accessing a cross-origin frame.
      window.opener = null;
    }
  }

  public handleMsalPasswordChange(): void {
    this.removeHash();
    sessionStorage.clear();
    const msalContext = this.handleMsalLogin();
    msalContext.loginRedirect([environment.msalScope]);
  }

  private removeHash() {
    history.pushState('', document.title, window.location.pathname + window.location.search);
  }


  public handleMsalForgotPassword(): void {
    let forgotPasswordUri = `https://login.microsoftonline.com/${environment.msalTenant}.onmicrosoft.com/oauth2/v2.0/authorize`;
    forgotPasswordUri += '?p=' + environment.msalResetPasswordPolicy;
    forgotPasswordUri += '&client_id=' + environment.msalClient;
    forgotPasswordUri += '&nonce=defaultNonce';
    forgotPasswordUri += '&redirect_uri=' + encodeURIComponent(window.location.origin);
    forgotPasswordUri += '&scope=openid';
    forgotPasswordUri += '&response_type=id_token';
    forgotPasswordUri += '&prompt=login';

    window.location.href = forgotPasswordUri;
  }


  public handleMsalLogin(): UserAgentApplication {
    const authority =
      `https://login.microsoftonline.com/tfp/${environment.msalTenant}.onmicrosoft.com/` + `${environment.msalSigninSignupPolicy}`;
    return new UserAgentApplication(environment.msalClient, authority, () => {});
  }

  private getJsonFromUrl(url: string): any {
    // TODO: Shouldn't return any
    const result: any = {}; // TODO: Shouldn't be any
    url.split('&').forEach((part: string) => {
      const item = part.split('=');
      const key = item[0];
      result[key] = decodeURIComponent(item[1]);
    });
    return result;
  }
}
