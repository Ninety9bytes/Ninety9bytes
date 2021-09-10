import {SharedModule} from '../_shared/shared.module';

import { DataImportParentComponent } from './components/data-import-parent.component';
import { DataImportUploadComponent } from './components/data-import-upload.component';
import { DataImportMappingComponent } from './components/data-import-mapping.component';
import { DataImportReviewComponent } from './components/data-import-review.component';
import { DataImportFinishComponent } from './components/data-import-finish.component';
import { DataImportWizardComponent } from './components/data-import-wizard.component';
import { CreateCustomColumnComponent } from './components/create-custom-column.component';

import { DataCopyGroupsComponent } from './components/data-copy-groups.component';
import { DataCopyFinishComponent } from './components/data-copy-finish.component';
import { DataCopyWizardComponent } from './components/data-copy-wizard.component';

import { ShowAutoMappedPipe } from './pipes/show-auto-mapped.pipe';
import { ImportTemplatesApiService } from '../_api/_configuration/services/import-templates-api.service';
import { DataImportService } from './services/data-import.service';
import { DataCopyService } from './services/data-copy.service';
import { CoreModule } from '../_core/core.module';
import { OrderModule } from 'ngx-order-pipe';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { HttpClientModule } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { DataImportRepository } from '../_api/services/data-import/data-import-repository.service';
import { ProsRenewalWizardComponent } from './components/pros-renewal-wizard.component';
import { DataProsRenewalComponent } from './components/data-pros-renewal.component';


@NgModule({
  imports: [
    CoreModule,
    SharedModule,
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    GridModule,
    HttpClientModule,
    LaddaModule,
    OrderModule
  ],
  declarations: [
    DataImportParentComponent,
    DataImportUploadComponent,
    DataImportMappingComponent,
    DataImportReviewComponent,
    DataImportFinishComponent,
    DataImportWizardComponent,
    DataCopyGroupsComponent,
    DataCopyFinishComponent,
    DataCopyWizardComponent,
    CreateCustomColumnComponent,
    ShowAutoMappedPipe,
    ProsRenewalWizardComponent,
    DataProsRenewalComponent
  ],
  providers: [
    DataImportRepository,
    DataImportService,
    DataCopyService,
    ImportTemplatesApiService
  ]
})
export class DataImportModule {}
