import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';

import { GroupManagementComponent } from './components/group-management.component';
import { GroupManagementModalComponent } from './components/group-management-modal.component';

import { GroupsService } from './services/groups.service';
import { EditGroupTemplateComponent } from './components/edit-group-template.component';
import { AdminModule } from '../admin/admin.module';
import { GroupManagementFormComponent } from './components/group-management-form.component';
import { CoreModule } from '../_core/core.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { GroupApiService } from '../_api/_runtime/services/group-api.service';
import { TemplatesApiService } from '../_api/_configuration/services/templates-api.service';

@NgModule({
  imports: [
    CommonModule,
    GridModule,
    DateInputsModule,
    RouterModule,
    FormsModule,
    OrderModule,
    SharedModule,
    AdminModule,
    CoreModule
  ],
  declarations: [
    GroupManagementComponent,
    GroupManagementModalComponent,
    EditGroupTemplateComponent,
    GroupManagementFormComponent
  ],
  entryComponents: [
    GroupManagementModalComponent
  ],
  providers: [
    GroupsService,
    GroupApiService,
    TemplatesApiService
  ]
})
export class GroupsModule {}
