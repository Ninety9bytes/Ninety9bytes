import { AdminHomeComponent } from './components/admin-home.component';

import { UserHomeComponent } from './components/user/user-home.component';
import { UserListComponent } from './components/user/user-list.component';
import { UserEditComponent } from './components/user/user-edit.component';

import { TeamEditComponent } from './components/team/team-edit.component';
import { TeamHomeComponent } from './components/team/team-home.component';
import { TeamListComponent } from './components/team/team-list.component';

import { TemplateManagementComponent } from './components/template/template-management.component';

import { SharedModule } from '../_shared/shared.module';
import { TemplateBuilderWizardComponent } from './components/template/wizard/template-builder-wizard.component';
import { TemplateBuilderStep1Component } from './components/template/wizard/template-builder-step1/template-builder-step1.component';
import { TemplateBuilderStep2Component } from './components/template/wizard/template-builder-step2/template-builder-step2.component';
import { TemplateBuilderStep3Component } from './components/template/wizard/template-builder-step3/template-builder-step3.component';
import { TemplateBuilderStep4Component } from './components/template/wizard/template-builder-step4/template-builder-step4.component';
import { CustomFieldComponent } from './components/template/wizard/custom-field/custom-field.component';
import { TemplateService } from './services/template.service';
import { GroupSaveService } from './services/group-save-service';
import { GroupSaveComponent } from './components/group-saves/group-save.component';
import { RestoreModalComponent } from './components/group-saves/restore-modal.component';
import { CoreModule } from '../_core/core.module';
import { NgModule } from '@angular/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { IntlModule } from '@progress/kendo-angular-intl';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragulaModule, DragulaService } from 'ng2-dragula';
import { OrderModule } from 'ngx-order-pipe';
import { TemplateRepositoryService } from '../_api/services/admin/template-repository.service';
import { ModuleRepositoryService } from '../_api/services/module-repository.service';
import { CountryRepositoryService } from '../_api/services/country-repository.service';
import { OfficeRepositoryService } from '../_api/services/office-repository.service';
import { RemoveDeactivatedComponent } from './components/remove-deactivated/remove-deactivated.component';
import { RemoveDeactivatedService } from './services/remove-deactivated.service';

@NgModule({
  imports: [
    GridModule,
    IntlModule,
    RouterModule,
    CommonModule,
    GridModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    DragulaModule,
    CoreModule,
    SharedModule,
    OrderModule,
  ],
  declarations: [
    AdminHomeComponent,
    UserHomeComponent,
    UserListComponent,
    UserEditComponent,
    TeamHomeComponent,
    TeamListComponent,
    TeamEditComponent,
    TemplateManagementComponent,
    TemplateBuilderWizardComponent,
    TemplateBuilderStep1Component,
    TemplateBuilderStep2Component,
    TemplateBuilderStep3Component,
    TemplateBuilderStep4Component,
    CustomFieldComponent,
    GroupSaveComponent,
    RestoreModalComponent,
    RemoveDeactivatedComponent
  ],
  entryComponents: [
    RestoreModalComponent
  ],
  exports: [
    TemplateBuilderWizardComponent,
    TemplateBuilderStep1Component,
    TemplateBuilderStep2Component,
    TemplateBuilderStep3Component,
    TemplateBuilderStep4Component
  ],
  providers: [
    TemplateService,
    GroupSaveService,
    TemplateRepositoryService,
    ModuleRepositoryService,
    CountryRepositoryService,
    OfficeRepositoryService,
    DragulaService,
    RemoveDeactivatedService
  ]
})
export class AdminModule {}
