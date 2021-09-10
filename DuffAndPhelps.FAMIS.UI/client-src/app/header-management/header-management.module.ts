import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';

import { HeaderManagementComponent } from './components/header-management.component';
import { HeaderManagementMemberComponent } from './components/header-management-member.component';
import { MemberUpsertComponent } from './components/actions/member-upsert.component';
import { HeaderManagementSiteComponent } from './components/header-management-site.component';
import { SiteUpsertComponent } from './components/actions/site-upsert.component';
import { HeaderManagementAccountComponent } from './components/header-management-account.component';
import { AccountUpsertComponent } from './components/actions/account-upsert.component';
import { HeaderManagementDepartmentComponent } from './components/header-management-department.component';
import { DepartmentUpsertComponent } from './components/actions/department-upsert.component';
import { HeaderManagementService } from './services/header-management.service';
import { CoreModule } from '../_core/core.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { LaddaModule } from 'angular2-ladda';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    DateInputsModule,
    RouterModule,
    FormsModule,
    OrderModule,
    CommonModule,
    FormsModule,
    SharedModule,
    LaddaModule,
    NgbModule,
    CoreModule
  ],
  declarations: [
    HeaderManagementComponent,
    HeaderManagementMemberComponent,
    MemberUpsertComponent,
    HeaderManagementSiteComponent,
    SiteUpsertComponent,
    HeaderManagementAccountComponent,
    AccountUpsertComponent,
    HeaderManagementDepartmentComponent,
    DepartmentUpsertComponent
  ],
  entryComponents: [
    MemberUpsertComponent,
    SiteUpsertComponent,
    AccountUpsertComponent,
    DepartmentUpsertComponent
  ],
  providers: [
    HeaderManagementService
  ]
})
export class HeaderManagementModule {}
