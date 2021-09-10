import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';

import { TrendingSummaryComponent } from './trending/components/trending-summary.component';
import { TrendingSetupComponent } from './trending/components/trending-setup.component';
import { TrendingFormComponent } from './trending/components/trending-form.component';

import { ProcessingService } from './services/processing.service';
import { TrendingService } from './trending/services/trending.service';
import { DepreciationService } from './depreciation/services/depreciation.service';
import { DepreciationSummaryComponent } from './depreciation/components/depreciation-summary.component';
import { DepreciationFormComponent } from './depreciation/components/depreciation-form.component';
import { DepreciationSetupComponent } from './depreciation/components/depreciation-setup.component';
import { ProcessingSummaryComponent } from './components/processing-summary.component';
import { DepreciationFormService } from './depreciation/services/depreciation-form.service';
import { CoreModule } from '../_core/core.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { LaddaModule } from 'angular2-ladda';
import { ReferenceDataApiService } from '../_api/_configuration/services/reference-data-api.service';
import { DataProcessingApiService } from '../_api/_configuration/services/data-processing-api.service';
import { ProcessingApiService } from '../_api/_runtime/services/processing-api.service';
import { InventoryApiService } from '../_api/_runtime/services/inventory-api.service';
import { ViewModelsApiService } from '../_api/_runtime/services/view-models-api.service';
import { InsuranceApiService } from '../_api/_runtime/services/insurance-api.service';

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
    LaddaModule
  ],
  declarations: [
    TrendingSummaryComponent,
    TrendingSetupComponent,
    TrendingFormComponent,
    DepreciationSetupComponent,
    ProcessingSummaryComponent,
    DepreciationSummaryComponent,
    DepreciationFormComponent
  ],
  entryComponents: [],
  providers: [
    ProcessingService,
    TrendingService,
    DepreciationService,
    DepreciationFormService,
    ReferenceDataApiService,
    DataProcessingApiService,
    ProcessingApiService,
    InventoryApiService,
    ViewModelsApiService,
    InsuranceApiService
  ]
})
export class ProcessingModule {}
