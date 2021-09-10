import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard.component';

import { DashboardHomeComponent } from './components/dashboard-home.component';
import { ContractSummaryService } from './services/contract-summary.service';
import { CoreModule } from '../_core/core.module';
import { SharedModule } from '../_shared/shared.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { RouterModule } from '@angular/router';
import { OrderModule } from 'ngx-order-pipe';
import { ContractService } from '../_api/services/dashboard/contract.service';
import { ApiService } from '../_api/services/api.service';


@NgModule({
  imports: [CoreModule, CommonModule, GridModule, RouterModule, SharedModule, OrderModule],
  declarations: [DashboardHomeComponent, DashboardComponent],
  providers: [ApiService, ContractService, ContractSummaryService]
})
export class DashboardModule {}
