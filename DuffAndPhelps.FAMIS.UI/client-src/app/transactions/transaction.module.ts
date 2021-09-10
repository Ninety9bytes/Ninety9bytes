import { TransactionsGridComponent } from './components/transactions-grid.component';
import { SharedModule } from '../_shared/shared.module';
import { TransactionsService } from './services/transactions.service';
import { CoreModule } from '../_core/core.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
    TransactionsGridComponent
  ],

  providers: [TransactionsService]
})

export class TransactionsModule { }
