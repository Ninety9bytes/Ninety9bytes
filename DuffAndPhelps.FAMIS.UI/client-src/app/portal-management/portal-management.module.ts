import { SharedModule } from '../_shared/shared.module';
import { PortalManagementComponent } from './components/portal-management.component';
import { SetupPortalComponent } from './components/setup-portal.component';
import { SetupDataComponent } from './components/setup-data.component';
import { SetupAccessComponent } from './components/setup-access.compontent';
import { AddPortalAccessComponent } from './components/Actions/add-portal-access-modal.component';
import { PortalManagementService } from './services/portal-management.service';
import { AlertService } from '../_core/services/alert.service';
import { CopyGroupComponent } from './components/copy-group.component';
import { ContractSearchComponent } from './components/contract-search.component';
import { SetupImageComponent } from './components/setup-image.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClientApiService } from '../_api/_runtime/services/client-api.service';
import { SetupMetadataComponent } from './components/setup-metadata.component';
import { ReportsService } from '../reports/services/reports.service';
import { ReportsModule } from '../reports/reports.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    OrderModule,
    SharedModule,
    ReportsModule,
    GridModule,
    DropDownsModule
  ],
  declarations: [
    PortalManagementComponent,
    SetupPortalComponent,
    SetupDataComponent,
    SetupAccessComponent,
    AddPortalAccessComponent,
    CopyGroupComponent,
    ContractSearchComponent,
    SetupImageComponent,
    SetupMetadataComponent
  ],
  entryComponents: [
    PortalManagementComponent,
    AddPortalAccessComponent,
    CopyGroupComponent
  ],
  providers: [
    PortalManagementService,
    NgbModal,
    AlertService,
    ClientApiService,
    ReportsService
  ]
})
export class PortalManagementModule {}
