import { RecipientsGridComponent } from './components/recipients-grid.component';
import { RecipientsService } from './services/recipients.service';
import { RecipientsComponent } from './components/recipients.component';
import { SharedModule } from '../_shared/shared.module';
import { RecipientsApiService } from '../_api/_runtime/services/recipients-api.service';
import { UpsertRecipientComponent } from './components/actions/upsert-recipient.component';
import { RemoveRecipientComponent } from './components/actions/remove-recipient.component';
import { CoreModule } from '../_core/core.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { OrderModule } from 'ngx-order-pipe';
import { GridModule } from '@progress/kendo-angular-grid';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LaddaModule,
    OrderModule,
    GridModule,
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    CoreModule
  ],
  declarations: [
    RecipientsGridComponent,
    RecipientsComponent,
    UpsertRecipientComponent,
    RemoveRecipientComponent
  ],
  entryComponents: [
    UpsertRecipientComponent,
    RemoveRecipientComponent
  ],
  providers: [
    RecipientsService,
    RecipientsApiService
  ]
})
export class RecipientsModule { }
