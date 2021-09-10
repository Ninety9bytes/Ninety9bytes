import { DragulaModule } from 'ng2-dragula';
import { CurrencyMaskModule } from 'ng2-currency-mask';

import { AlertService } from '../_core/services/alert.service';
import { SharedModule } from '../_shared/shared.module';

import { ReconcileDataGridComponent } from './components/reconcile-data-grid.component';
import { ReconcileDataAllocationsComponent } from './components/reconcile-data-allocations.component';
import { AllocationService } from './services/allocation.service';
import { ParentChildService } from './services/parent-child.service';
import { ParentChildMatchComponent } from './components/parent-child-match.component';
import { ParentChildMatchDetailComponent } from './components/parent-child-match-detail.component';

import { ReconcileDataService } from './services/reconcile-data.service';
import { ReconcileMatchService } from './services/reconcile-match.service';
import { ReconciliationInventoryService } from './services/inventory.service';
import { ConsolidationService } from './services/consolidation.service';

import { MassMatchService } from './services/mass-match/mass-match.service';
import { MassMatchComponent } from './components/mass-match/mass-match.component';
import { FilterCriteriaBuilderComponent } from './components/mass-match/filter-criteria-builder.component';
import { FieldMatchesComponent } from './components/mass-match/field-matches.component';
import { FilterOperationsService } from '../_core/services/filter-operations.service';


import { ReconcileDataComponent } from './components/reconcile-data.component';
import { ReconciliationFormComponent } from './components/reconciliation-form.component';
import { CopyInventoryComponent } from './components/copy-inventory.component';
import { CreateMatchCodeComponent } from './components/create-match-code.component';
import { MatchCodesComponent } from './components/match-codes.component';
import { SetupComponent } from './components/setup.component';
import { MapMatchCodesComponent } from './components/map-matchcodes.component';
import { DefineLayoutComponent } from './components/define-layout.component';

import { OrderAssetColumnsComponent } from './components/order-asset-columns-component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ViewMatchesComponent } from './components/mass-match/view-matches.component';

import { UpsertAssetRecordComponent } from './components/upsert-asset-record.component';
import { AssetColumnSelectComponent } from './components/consolidated/asset-column-select.component';
import { AssetSelectedColumnsComponent } from './components/consolidated/asset-selected-columns.component';
import { ReconciliationValidationComponent } from './components/reconciliation-validation.component';
import { FinalizeDataComponent } from './components/finalize-data.component';
import { ConsolidationMatchCodeAssignmentComponent } from './components/consolidated/consolidation-match-code-assignment.component';
import { DynamicAssignmentFieldComponent } from './components/consolidated/dynamic-assignment-select.component';
import { ReconcileDataGridService } from './services/reconcile-data-grid.service';
import { DestinationColumnSelectorComponent } from './components/consolidated/destination-column-selector.component';
import { CoreModule } from '../_core/core.module';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { HttpClientModule } from '@angular/common/http';
import { LaddaModule } from 'angular2-ladda';
import { RouterModule } from '@angular/router';
import { OrderModule } from 'ngx-order-pipe';
import { ApiService } from '../_api/services/api.service';
import { ReconciliationMatchService } from '../_api/services/reconciliation/reconcilation-match.service';
import { CostFieldsService } from '../_api/services/reconciliation/cost-fields.service';
import { MatchCodesService } from '../_api/services/reconciliation/match-codes.service';
import { InventorySearchRepository } from '../_api/services/inventory/inventory-search-repository.service';
import { InventoryApiService } from '../_api/_runtime/services/inventory-api.service';
import { CalculationApiService } from '../_api/_runtime/services/calculation-api.service';
import { SettingsApiService } from '../_api/_runtime/services/settings-api.service';
import { InventoryService } from '../_api/services/reconciliation/inventory.service';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { OneToManyMatchComponent } from './components/mass-match/one-to-many-match.component';
import { ManyToOneMatchComponent } from './components/mass-match/many-to-one-match.component';

@NgModule({
  imports: [
    GridModule,
    CoreModule,
    SharedModule,
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    CommonModule,
    DragulaModule,
    FormsModule,
    DropDownsModule,
    HttpClientModule,
    LaddaModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    OrderModule,
    CurrencyMaskModule,
    DateInputsModule,
    LaddaModule,
    LayoutModule
  ],
  declarations: [
    ReconcileDataComponent,
    ReconciliationFormComponent,
    CopyInventoryComponent,
    CopyInventoryComponent,
    CreateMatchCodeComponent,
    ParentChildMatchComponent,
    ParentChildMatchDetailComponent,
    MatchCodesComponent,
    SetupComponent,
    ReconcileDataAllocationsComponent,
    ReconcileDataGridComponent,
    OrderAssetColumnsComponent,
    MassMatchComponent,
    FilterCriteriaBuilderComponent,
    FieldMatchesComponent,
    UpsertAssetRecordComponent,
    ViewMatchesComponent,
    FilterCriteriaBuilderComponent,
    DefineLayoutComponent,
    MapMatchCodesComponent,
    AssetColumnSelectComponent,
    AssetSelectedColumnsComponent,
    ReconciliationValidationComponent,
    FinalizeDataComponent,
    ConsolidationMatchCodeAssignmentComponent,
    DynamicAssignmentFieldComponent,
    DestinationColumnSelectorComponent,
    OneToManyMatchComponent,
    ManyToOneMatchComponent
  ],
  entryComponents: [ReconciliationFormComponent, FilterCriteriaBuilderComponent, FieldMatchesComponent],
  providers: [
    ReconcileDataService,
    ApiService,
    ReconciliationMatchService,
    ReconciliationInventoryService,
    CostFieldsService,
    MatchCodesService,
    InventorySearchRepository,
    ReconcileMatchService,
    AllocationService,
    AlertService,
    InventoryService,
    ParentChildService,
    MassMatchService,
    FilterOperationsService,
    ParentChildService,
    ConsolidationService,
    ReconcileDataGridService,
    InventoryApiService,
    CalculationApiService,
    SettingsApiService
  ]
})
export class ReconciliationModule {}
