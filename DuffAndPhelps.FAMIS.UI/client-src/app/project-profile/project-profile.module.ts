// Components
import { ProjectProfileComponent } from './components/project-profile.component';
import { ProjectProfileDynamicFieldComponent } from './components/dynamic-field.component';
import { TemplateFormComponent } from './components/template-form.component';
import { CostFieldsService } from '../_api/services/reconciliation/cost-fields.service';
import { MatchCodesService } from '../_api/services/reconciliation/match-codes.service';
import { SharedModule } from '../_shared/shared.module';
import { MatchCodesComponent } from '../reconciliation/components/match-codes.component';
import { CreateMatchCodeComponent } from '../reconciliation/components/create-match-code.component';
import { SetupComponent } from '../reconciliation/components/setup.component';
import { CopyInventoryComponent } from '../reconciliation/components/copy-inventory.component';
import { TaskManagementComponent } from './components/tasks/task-management.component';
import { TasksService } from './services/tasks.service';
import { EditTaskComponent } from './components/tasks/edit-task.component';
import { AdministrationComponent } from './components/administration/administration.component';
import { AdministrationFormComponent } from './components/administration/administration-form.component';

import { DatePickerModule } from '@progress/kendo-angular-dateinputs';
import { AlertService } from '../_core/services/alert.service';
import { ProjectProfileService } from './services/project-profile.service';
import { AdministrationService } from './services/administration.service';
import { CoreModule } from '../_core/core.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { OrderModule } from 'ngx-order-pipe';
import { GridModule } from '@progress/kendo-angular-grid';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IsMatchedPipe } from '../_shared/pipes/is-matched.pipe';
import { ProjectProfileAPIService } from '../_api/services/project-profile/project-profile-api.service';
import { ProjectProfileControlService } from '../_api/services/project-profile/project-profile-control.service';
import { ApiService } from '../_api/services/api.service';
import { ReconciliationMatchService } from '../_api/services/reconciliation/reconcilation-match.service';
import { GroupApiService } from '../_api/_runtime/services/group-api.service';
import { ContractApiService } from '../_api/_runtime/services/contract-api.service';
import { ModulesApiService } from '../_api/_configuration/services/modules-api.service';

@NgModule({
  imports: [
    CoreModule,
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LaddaModule,
    SharedModule,
    OrderModule,
    GridModule,
    RouterModule,
    DatePickerModule,
    BrowserModule,
    BrowserAnimationsModule
  ],
  declarations: [
    ProjectProfileComponent,
    ProjectProfileDynamicFieldComponent,
    TaskManagementComponent,
    EditTaskComponent,
    IsMatchedPipe,
    TemplateFormComponent,
    AdministrationComponent,
    AdministrationFormComponent
  ],

  providers: [
    ProjectProfileAPIService,
    ProjectProfileControlService,
    ApiService,
    ReconciliationMatchService,
    TasksService,
    AlertService,
    ProjectProfileService,
    GroupApiService,
    ContractApiService,
    ModulesApiService,
    AdministrationService
  ]
})
export class ProjectProfileModule {}
