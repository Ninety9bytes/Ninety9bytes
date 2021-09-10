import { LoggingService } from './services/logging.service';
import { ErrorHandlerService } from './services/error-handler.service';
import { AlertService } from './services/alert.service';
import { HelperService } from './services/helper.service';
import { RulesGuard } from './guards/rules-guard.service';
import { AssetFileInfoService } from './services/asset-file-info-service';
import { BuildingInfoService } from './services/building-info-service';
import { FamisGridService } from './services/famis-grid.service';
import { GoogleMapsService } from './services/google-maps-config.service';
import { LeftNavService } from './services/left-nav-service';
import { TransactionsInfoService } from './services/transactions-info-service';
import { RecipientsInfoService } from './services/recipients-info-service';
import { CanDeactivateGuard } from './guards/can-deactivate-guard.service';
import { CanDeactivateService } from './guards/can-deactivate.service';
import { AuthGuard } from './authentication/auth-guard';
import { UserStore } from './user/user.store';
import { AuthenticationManager } from './authentication/authentication.manager';
import { AuthorizationApiService } from '../_api/_authorization/services/authorization-api.service';
import { ShowIfCanAccessDirective } from './directives/show-if-can-access';
import { CanAccessGuard } from './authentication/can-access.guard';
import { TranslateHttpLoader } from '../../../node_modules/@ngx-translate/http-loader';
import { TranslateModule } from '../../../node_modules/@ngx-translate/core';
import { ImageService } from './services/image.service';
import { UserGridService } from './services/user-grid.service';
import { WindowManager } from './services/window-manager.service';
import { WindowService } from '@progress/kendo-angular-dialog';
import { TranslationManager } from './i18n/translation-manager';
import { NgModule, ErrorHandler, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CountriesApiService } from '../_api/_configuration/services/countries-api.service';
import { AccountApiService } from '../_api/_authorization/services/account-api.service';
import { LAZY_MAPS_API_CONFIG } from '@agm/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  imports: [CommonModule, BrowserAnimationsModule
  ],
  declarations: [ShowIfCanAccessDirective],
  exports: [CommonModule, BrowserAnimationsModule, ShowIfCanAccessDirective, TranslateModule],
  providers: [
    AuthGuard,
    CanAccessGuard,
    UserStore,
    AuthenticationManager,
    AlertService,
    LoggingService,
    FamisGridService,
    HelperService,
    ImageService,
    RulesGuard,
    CanDeactivateGuard,
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    AssetFileInfoService,
    BuildingInfoService,
    { provide: LAZY_MAPS_API_CONFIG, useClass: GoogleMapsService },
    TransactionsInfoService,
    RecipientsInfoService,
    CanDeactivateService,
    AccountApiService,
    AuthorizationApiService,
    CountriesApiService,
    UserGridService,
    WindowManager,
    WindowService,
    TranslationManager,
    LeftNavService
  ]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule
    };
  }
}
