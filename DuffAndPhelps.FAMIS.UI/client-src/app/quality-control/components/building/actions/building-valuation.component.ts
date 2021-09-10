import { ValuationService } from '../../../services/valuation-service';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../../_core/services/window-manager.service';
import { Component, OnInit, OnDestroy, EventEmitter, ViewChild, Output, ViewContainerRef } from '@angular/core';
import { Building } from '../../../../_models/building.model';
import { ValuationResponseDto } from '../../../../_api/_runtime/dtos/building.dto';
import { EnumDto } from '../../../../_api/_configuration/dtos/enum.dto';
import { ApiServiceResult } from '../../../../_api/dtos/api-service-result.dto';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { WindowOption } from '../../../../_models/window-option';

@Component({
  selector: 'building-valuation',
  templateUrl: './building-valuation.component.html'
})
export class BuildingValuationComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public selectedBuildings = new Array<Building>();
  public valuationRequestSubmitted = false;
  public dynamicActionButtonText = 'Cancel';
  public dynamicModalHeaderText = 'CoreLogic Submission';
  public apiErrorResponse: Array<ValuationResponseDto>;
  public responseArrived = false;
  public errorMappings: ApiServiceResult<EnumDto>;
  public hasValuationErrors = false;
  public totalRecordCount = 0;
  public errorRecordCount = 0;

  @ViewChild('content', {static: false}) private content: any; // intentional, following previous examples
  @Output() onAction = new EventEmitter<boolean>();

  private windowRef: WindowRef;

  constructor(
    public windowManager: WindowManager,
    private valuationService: ValuationService,
    public container: ViewContainerRef
  ) {}

  ngOnInit() {
    this.valuationService.getBuildingValuationErrorMappings();
  }

  ngOnDestroy() {}

  handleAction() {}

  open(fromValuationErrorButton: boolean, items?: Array<Building>) {
    this.totalRecordCount = items.length;
    if (fromValuationErrorButton) {
      this.valuationRequestSubmitted = true;
      this.dynamicActionButtonText = 'Close';
      this.dynamicModalHeaderText = 'Submission Summary';
      this.responseArrived = true;
    } else {
      this.valuationRequestSubmitted = false;
      this.dynamicActionButtonText = 'Cancel';
      this.dynamicModalHeaderText = 'CoreLogic Submission';
      this.responseArrived = false;
    }
    this.selectedBuildings = items;
    this.windowRef = this.windowManager.open(this.content, this.dynamicModalHeaderText, <WindowOption>{
      isModal: true
    });
  }

  // Retire Asset(s)

  cancel() {
    this.dynamicModalHeaderText = 'CoreLogic Submission';
    this.dynamicActionButtonText = 'Cancel';
    this.valuationRequestSubmitted = false;
    this.responseArrived = false;
    this.windowRef.close();
  }

  confirm() {
    this.valuationRequestSubmitted = true;
    this.dynamicActionButtonText = 'Close';
    this.dynamicModalHeaderText = 'Submission Summary';
    this.hasValuationErrors = false;
    this.onAction.emit(this.hasValuationErrors);
    const buildingIds: string[] = [];
    this.selectedBuildings.forEach(building => {
      buildingIds.push(building.id);
    });

    this.valuationService.submitBuildingValuation(buildingIds).subscribe(response => {
      this.apiErrorResponse = response.filter(bv => bv.success === false);
      this.hasValuationErrors = response.findIndex(bv => !bv.success) !== -1;
      this.responseArrived = true;
      this.errorMappings = this.valuationService.buildingValuationErrors;
    });
  }

  getEnumDisplayName(id: number): string {
    this.hasValuationErrors = true;
    this.onAction.emit(this.hasValuationErrors);
    return this.errorMappings.result.enumOptions[id].displayName;
  }
}
