import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../_shared/shared.module';
import { DatePickerModule, DateInputsModule } from '@progress/kendo-angular-dateinputs';

import { QualityControlService } from './services/quality-control.service';

import { QualityControlComponent } from './components/quality-control.component';
import { QualityControlFormComponent } from './components/quality-control-form.component';
import { MassUpdateFormComponent } from './components/mass-update/mass-update-form.component';
import { MassUpdateCriteriaComponent } from './components/mass-update/mass-update-criteria.component';
import { MassUpdateResultsComponent } from './components/mass-update/mass-update-results.component';
import { MassUpdateService } from './services/mass-update.service';
import { DuplicateCheckService } from './services/duplicate-check/duplicate-check.service';
import { AssetRetirementComponent } from './components/actions/asset-retirement.component';
import { QualityControlActionsService } from './services/actions/quality-control-actions.service';
import { AssetTransferComponent } from './components/actions/asset-transfer.component';
import { CostAdjustmentComponent } from './components/actions/cost-adjustment.component';
import { DuplicateCheckComponent } from './components/duplicate-check/duplicate-check.component';
import { AddContentComponent } from './components/content/actions/add-content.component';
import { QualityControlContentGridComponent } from './components/content/quality-control-content-grid.component';
import { QualityControlBuildingGridComponent } from './components/building/quality-control-building-grid.component';
import { BuildingsService } from './services/buildings.service';
import { EditContentComponent } from './components/content/actions/edit-content.component';
import { MassUpdateContentComponent } from './components/content/actions/mass-update-content.component';
import { MassUpdateBuildingComponent } from './components/building/actions/mass-update-building.component';
import { ValuationService } from './services/valuation-service';
import { BuildingValuationComponent } from './components/building/actions/building-valuation.component';
import { FloodPlainValuationComponent } from './components/building/actions/floodplain-valuation.component';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CoreModule } from '../_core/core.module';
import { ViewContentComponent } from './components/content/actions/view-content.component';
// TODO: Refactor this
// import { ViewBuildingComponent } from './components/building/actions/view-building.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { AdditionalDataService } from './services/additional-data/additional-data.service';
import { AdditionalDataGridService } from './services/additional-data/additional-data-grid.service';
// tslint:disable-next-line:max-line-length
import { BuildingAttributeService } from './services/building-attribute.service';
import { AdditionalBuildingEquipmentComponent } from './components/building/form/dynamic-data-grids/additional-data/additional-building-equipment-grid.component';
import { BuildingFormGroupComponent } from './components/building/form/building-form-group.component';
import { UserFactorGridComponent } from './components/building/form/dynamic-data-grids/user-factor-grid/user-factor-grid.component';
// tslint:disable-next-line:max-line-length
import { UpsertCustomAdditionComponent } from './components/building/form/dynamic-data-grids/custom-additions/actions/upsert-customaddition.component';
import { UpsertUserFactorComponent } from './components/building/form/dynamic-data-grids/user-factor-grid/actions/upsert-userfactor.component';
// tslint:disable-next-line:max-line-length
import { RemoveCustomAdditionComponent } from './components/building/form/dynamic-data-grids/custom-additions/actions/remove-customaddition.component';
// tslint:disable-next-line:max-line-length
import { RemoveUserFactorComponent } from './components/building/form/dynamic-data-grids/user-factor-grid/actions/remove-userfactor.component';
import { UpsertBuildingComponent } from './components/building/form/building-form.component';
// tslint:disable-next-line:max-line-length
import { BuildingAttributesGridComponent } from './components/building/form/dynamic-data-grids/building-attributes/building-attributes-grid.component';
import { UpsertBuildingAttributeComponent } from './components/building/form/dynamic-data-grids/building-attributes/upsert-building-attribute.component';
// tslint:disable-next-line:max-line-length
import { UpsertBuildingAdditionComponent } from './components/building/form/dynamic-data-grids/additional-data/upsert-building-addition.component';
import { UpsertOccupancyCodesComponent } from './components/building/form/dynamic-data-grids/occupancy-codes/upsert-occupancy-code.component';
import { OccupancyCodesGridComponent } from './components/building/form/dynamic-data-grids/occupancy-codes/occupancy-codes-grid.component';
// tslint:disable-next-line:max-line-length
import { CustomAdditionsGridComponent } from './components/building/form/dynamic-data-grids/custom-additions/custom-additions-grid.component';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderModule } from 'ngx-order-pipe';
import { LaddaModule } from 'angular2-ladda';
import { GridModule } from '@progress/kendo-angular-grid';
import { QualityControlApiService } from '../_api/_runtime/services/quality-control-api.service';
import { CalculationApiService } from '../_api/_runtime/services/calculation-api.service';
import { InsuranceApiService } from '../_api/_runtime/services/insurance-api.service';
import { GroupApiService } from '../_api/_runtime/services/group-api.service';



@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    DateInputsModule,
    InputsModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    OrderModule,
    CommonModule,
    FormsModule,
    SharedModule,
    LaddaModule,
    DatePickerModule,
    NgbModule,
    GridModule,
    ScrollToModule.forRoot(),

  ],
  declarations: [
    QualityControlComponent,
    QualityControlFormComponent,
    MassUpdateFormComponent,
    MassUpdateCriteriaComponent,
    MassUpdateResultsComponent,
    AssetRetirementComponent,
    AssetTransferComponent,
    CostAdjustmentComponent,
    DuplicateCheckComponent,
    AddContentComponent,
    QualityControlContentGridComponent,
    QualityControlBuildingGridComponent,
    EditContentComponent,
    MassUpdateContentComponent,
    MassUpdateBuildingComponent,
    ViewContentComponent,
    // ViewBuildingComponent,
    BuildingValuationComponent,
    FloodPlainValuationComponent,
    AdditionalBuildingEquipmentComponent,
    BuildingFormGroupComponent,
    UserFactorGridComponent,
    CustomAdditionsGridComponent,
    UpsertCustomAdditionComponent,
    UpsertUserFactorComponent,
    RemoveCustomAdditionComponent,
    RemoveUserFactorComponent,
    UpsertBuildingComponent,
    BuildingAttributesGridComponent,
    UpsertBuildingAttributeComponent,
    UpsertBuildingAdditionComponent,
    UpsertOccupancyCodesComponent,
    OccupancyCodesGridComponent
  ],
  entryComponents: [
    AssetRetirementComponent,
    AssetTransferComponent,
    CostAdjustmentComponent,
    BuildingValuationComponent,
    FloodPlainValuationComponent,
    UpsertCustomAdditionComponent,
    UpsertUserFactorComponent,
    RemoveCustomAdditionComponent,
    RemoveUserFactorComponent,
    UpsertBuildingAttributeComponent,
    BuildingFormGroupComponent,
    UpsertBuildingAdditionComponent,
    UpsertOccupancyCodesComponent
  ],
  providers: [
    QualityControlService,
    MassUpdateService,
    QualityControlActionsService,
    DuplicateCheckService,
    QualityControlApiService,
    CalculationApiService,
    BuildingsService,
    InsuranceApiService,
    GroupApiService,
    ValuationService,
    NgbActiveModal,
    AdditionalDataService,
    AdditionalDataGridService,
    BuildingAttributeService
  ]
})
export class QualityControlModule { }
