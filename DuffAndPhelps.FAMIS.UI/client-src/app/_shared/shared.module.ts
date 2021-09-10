import { GroupSearchComponent } from './components/group-search.component';
import { AlertComponent } from './components/alert.component';
import { AddAssetColumnComponent } from './components/add-asset-column-component';
import { GridColumnSelectorComponent } from './components/grid-column-selector/grid-column-selector.component';
import { GridColumnSelectorModalComponent } from './components/grid-column-selector/grid-column-selector-modal.component';
import { ConfirmComponent } from './components/confirm.component';
import { ConfirmModalComponent } from './components/confirm-modal.component';
import { GridContextMenuComponent } from './components/grid-column-selector/grid-context-menu.component';
import { TypeaheadComponent } from './components/typeahead.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { FilterCriteriaBuilderComponent } from './components/filter-criteria-builder.component';
import { FilterOperationsService } from '../_core/services/filter-operations.service';
import { FamisGridComponent } from './components/famis-grid.component';
import { ModalFormComponent } from './components/modal-form.component';
import { ReplaceFieldComponent } from './components/replace-field.component';
import { CarouselModalComponent } from './components/carousel-modal.component';
import { DatePipe, CommonModule } from '@angular/common';
import { ViewMapComponent } from './components/grid-actions/view-map.component';
import { GoogleMapComponent } from './components/google-map.component';
import { BingMapComponent } from './components/bing-map.component';
import { CoreModule } from '../_core/core.module';
import { GoogleMapsService } from '../_core/services/google-maps-config.service';
import { DynamicFormControlService } from '../_core/services/dynamic-form-control.service';
import { LAZY_MAPS_API_CONFIG, AgmCoreModule } from '@agm/core';
import { DynamicFieldComponent } from './components/dynamic-form/controls/dynamic-field.component';
import { CascadingComboBoxComponent } from './components/dynamic-form/controls/cascading-combo-box.component';
import { ImageUploadFieldComponent } from './components/dynamic-form/controls/image-upload-field.component';
import { AssetFormComponent } from './components/dynamic-form/asset-form.component';
import { RevertComponent } from './components/grid-actions/revert.component';
import { ViewImageComponent } from './components/grid-actions/view-image.component';
import { KendoGridTranslationComponent } from './components/kendo-grid-translation.component';
import { PowerBIComponent } from './components/power-bi/power-bi.component';
import { LocalTimePipe } from './pipes/local-time.pipe';
import { FamisSubGridComponent } from './components/famis-sub-grid.component';
import { LocalizedDatePipe } from './pipes/localized-date.pipe';
import { LocalizedNumberPipe } from './pipes/localized-number.pipe';
import { LocalizedPercentPipe } from './pipes/localized-percent.pipe';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { UserGridService } from '../_core/services/user-grid.service';
import { FilterService, SinglePopupService, GridModule } from '@progress/kendo-angular-grid';
import { GridFilterComponent } from './components/grid-filter/grid-filter.component';
import { WindowModule, WindowRef } from '@progress/kendo-angular-dialog';
import { DefaultTitleBarComponent } from './components/window/default-title-bar.component';
import { ModalBackdropComponent } from './components/window/modal-backdrop.component';
import { CopyAssetRecordComponent } from './components/copy-asset-modal/copy-asset-record.component';
import { FileUploadControlComponent } from './components/file-upload-control/file-upload-control.component';
import { DashboardGroupsComponent } from './components/dashboard-groups.component';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { OrderModule } from 'ngx-order-pipe';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LaddaModule } from 'angular2-ladda';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { EvenoddPipe } from './pipes/evenodd.pipe';
import { DynamicDataTranslation } from './pipes/dynamic-data-translation.pipe';
import { WizardService } from '../_ui/services/wizard.service';
import { GroupSearchService } from '../_api/services/group-search.service';
import { CustomDataTypesRepository } from '../_api/services/custom-data-types-repository.service';
import { ImageApiService } from '../_api/_runtime/services/image-api.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    GridModule,
    PopupModule,
    CoreModule,
    OrderModule,
    DateInputsModule,
    InputsModule,
    ReactiveFormsModule,
    LaddaModule,
    DropDownsModule,
    AgmCoreModule.forRoot(),
    WindowModule
  ],
  declarations: [
    EvenoddPipe,
    DynamicDataTranslation,
    GroupSearchComponent,
    AlertComponent,
    AddAssetColumnComponent,
    GridColumnSelectorComponent,
    GridColumnSelectorModalComponent,
    ConfirmComponent,
    ConfirmModalComponent,
    GridContextMenuComponent,
    TypeaheadComponent,
    FilterCriteriaBuilderComponent,
    FamisGridComponent,
    FamisSubGridComponent,
    ModalFormComponent,
    AssetFormComponent,
    DynamicFieldComponent,
    ReplaceFieldComponent,
    CascadingComboBoxComponent,
    ReplaceFieldComponent,
    CarouselModalComponent,
    ImageUploadFieldComponent,
    ViewMapComponent,
    ViewImageComponent,
    GoogleMapComponent,
    BingMapComponent,
    RevertComponent,
    KendoGridTranslationComponent,
    PowerBIComponent,
    LocalTimePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    LocalizedPercentPipe,
    GridFilterComponent,
    DefaultTitleBarComponent,
    ModalBackdropComponent,
    CopyAssetRecordComponent,
    FileUploadControlComponent,
    DashboardGroupsComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    EvenoddPipe,
    DynamicDataTranslation,
    GroupSearchComponent,
    AlertComponent,
    AddAssetColumnComponent,
    GridColumnSelectorComponent,
    GridColumnSelectorModalComponent,
    ConfirmComponent,
    ConfirmModalComponent,
    TypeaheadComponent,
    FilterCriteriaBuilderComponent,
    FamisGridComponent,
    FamisSubGridComponent,
    ModalFormComponent,
    AssetFormComponent,
    ReplaceFieldComponent,
    CascadingComboBoxComponent,
    CarouselModalComponent,
    ViewMapComponent,
    ViewImageComponent,
    RevertComponent,
    DynamicFieldComponent,
    PowerBIComponent,
    KendoGridTranslationComponent,
    LocalTimePipe,
    LocalizedDatePipe,
    LocalizedNumberPipe,
    ImageUploadFieldComponent,
    GridFilterComponent,
    CopyAssetRecordComponent,
    FileUploadControlComponent,
    GoogleMapComponent,
    BingMapComponent,
    DashboardGroupsComponent
  ],
  providers: [
    WizardService,
    GroupSearchService,
    CustomDataTypesRepository,
    ImageApiService,
    FilterOperationsService,
    UserGridService,
    DatePipe,
    FilterService,
    SinglePopupService,
    DynamicFormControlService,
    WindowRef,
    { provide: LAZY_MAPS_API_CONFIG,
      useClass: GoogleMapsService }
  ],
  entryComponents: [
    DynamicFieldComponent,
    ConfirmModalComponent,
    FilterCriteriaBuilderComponent,
    CarouselModalComponent,
    AssetFormComponent,
    ViewMapComponent,
    ViewImageComponent,
    RevertComponent,
    PowerBIComponent,
    ImageUploadFieldComponent,
    DefaultTitleBarComponent,
    ModalBackdropComponent
  ]
})
export class SharedModule {}
