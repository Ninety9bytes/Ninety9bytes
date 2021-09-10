import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { AppComponent } from './app.component';

import { CoreModule } from './_core/core.module';
import { DataImportModule } from './data-import/data-import.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ConfigModule, ConfigStaticLoader, ConfigLoader } from '@ngx-config/core';
import { ConfigHttpLoader } from '@ngx-config/http-loader';
import { environment } from '../environments/environment';
import { AdminModule } from './admin/admin.module';
import { ProjectProfileModule } from './project-profile/project-profile.module';
import { TranslateModule, TranslateLoader, MissingTranslationHandler } from '@ngx-translate/core';
import { routeConfig } from './app.configuration';
import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './_shared/shared.module';
import { NotFoundComponent } from './error/not-found.component';
import { UnauthorizedComponent } from './error/unauthorized.component';
import { AccessDeniedComponent } from './error/access-denied.component';
import { InternalServerErrorComponent } from './error/internal-server-error.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ProcessingModule } from './processing/processing.module';
import { GroupsModule } from './groups/groups.module';
import { QualityControlModule } from './quality-control/quality-control.module';
import { HeaderManagementModule } from './header-management/header-management.module';
import { PortalManagementModule } from './portal-management/portal-management.module';
import { RecipientsModule } from './recipients/recipients.module';
import { TransactionsModule } from './transactions/transaction.module';
import { ConflictServerErrorComponent } from './error/conflict-transaction-error.component';
import { CanDeactivateGuard } from './_core/guards/can-deactivate-guard.service';
import { HomeComponent } from './home.component';
import { ReportsModule } from './reports/reports.module';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';



// Kendo UI Locales
import '@progress/kendo-angular-intl/locales/en/all';
import '@progress/kendo-angular-intl/locales/fr/all';
import '@progress/kendo-angular-intl/locales/pt/all';
import '@progress/kendo-angular-intl/locales/it/all';
import '@progress/kendo-angular-intl/locales/es/all';

import { FileUploadModule } from './file-upload/file-upload.module';
import { TitleService } from './_core/services/title.service';
import { IdleTimeoutService } from './_core/services/idle-timeout.service';
import { SupportModule } from './support/support.module';
import { PLATFORM_ID, Inject, NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { LayoutModule } from '@progress/kendo-angular-layout';


// Azure App Settings Config Factory
export function configHttpFactory(http: HttpClient): ConfigLoader {
  return new ConfigHttpLoader(http, environment.settingsEndpoint); // API ENDPOINT
}

// Angular /environments config factory
export function configFactory(): ConfigLoader {
  return new ConfigStaticLoader(environment);
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/client-src/assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ConflictServerErrorComponent,
    InternalServerErrorComponent,
    UnauthorizedComponent,
    AccessDeniedComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // required animations module
    ToastrModule.forRoot({
      preventDuplicates: true,
      positionClass: 'toast-bottom-right',
      closeButton: true
    }), // ToastrModule added
    RouterModule.forRoot(routeConfig),
    SharedModule,
    CoreModule.forRoot(),
    ConfigModule.forRoot({
      provide: ConfigLoader,
      // If Production -> Load settings from Azure App Settings via configHttpFactory
      // If localhost -> Load settings from Angular /environments via configFactory
      useFactory: environment.useAzureAppSettings ? configHttpFactory : configFactory,
      deps: [HttpClient]
    }),
    DashboardModule,
    TranslateModule.forRoot(),
    DataImportModule,
    ProjectProfileModule,
    ReconciliationModule,
    AdminModule,
    NgbModule,
    HttpClientModule,
    ProcessingModule,
    GroupsModule,
    QualityControlModule,
    HeaderManagementModule,
    PortalManagementModule,
    RecipientsModule,
    TransactionsModule,
    ReportsModule,
    FileUploadModule,
    SupportModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LayoutModule
  ],
  providers: [CanDeactivateGuard, TitleService, IdleTimeoutService, HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(@Inject(PLATFORM_ID) private platformId: any, titleService: TitleService) {
    titleService.init();
  }
}
