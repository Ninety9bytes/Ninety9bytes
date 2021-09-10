import { SharedModule } from '../_shared/shared.module';
import { ReportsService } from './services/reports.service';
import { ReportsComponent } from './components/reports.component';
import { ReportsDeliverablesComponent } from './components/reports-deliverables.component';
import { ReportsApiService } from '../_api/_runtime/services/reports-api.service';
import { ReportsPowerBiComponent } from './components/reports-power-bi.component';
import { CoreModule } from '../_core/core.module';
import { ReportNameModalComponent } from './components/report-name-modal.component';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { OrderModule } from 'ngx-order-pipe';
import { GridModule } from '@progress/kendo-angular-grid';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CoreModule,
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LaddaModule,
    OrderModule,
    GridModule,
    RouterModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  declarations: [
    ReportsComponent,
    ReportsDeliverablesComponent,
    ReportsPowerBiComponent,
    ReportNameModalComponent
  ],
  entryComponents: [
    ReportNameModalComponent
  ],
  providers: [
    ReportsService,
    ReportsApiService
  ]
})
export class ReportsModule { }
