import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { HelperService } from '../../../../../../_core/services/helper.service';
import { OccupancyCodeBuildingAttributeTypeId } from '../../form-models/building-attributes-model';
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { BuildingDto, OccupancyCodeDto } from '../../../../../../_api/_runtime/dtos/building.dto';
import { AttributeTypeOption } from '../../../../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { OccupancyCodeModalResult } from '../../../../../../_models/occupancy-code-grid-item-model';
import { NgForm } from '@angular/forms';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';

@Component({
  selector: 'upsert-occupancy-code',
  templateUrl: './upsert-occupancy-code.component.html'
})
export class UpsertOccupancyCodesComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input()
  modalTitle: string = null;
  @Input()
  buildingDto: BuildingDto;
  @Input()
  occupancyCode: OccupancyCodeDto;

  @Input()
  options = new Array<AttributeTypeOption>();

  showValidationError = false;

  result = new EventEmitter<OccupancyCodeModalResult>();

  constructor(private helperService: HelperService) {}

  ngOnInit() {
    if (!this.occupancyCode) {
      this.occupancyCode = <OccupancyCodeDto>{
        id: this.helperService.generateGuid(),
        buildingAttributeCodeId: '',
        storyHeight: null,
        percent: null
      };
    } else {
      this.occupancyCode = Object.assign({}, this.occupancyCode);
    }

    this.occupancyCode.attributeType = OccupancyCodeBuildingAttributeTypeId;
  }

  save(form: NgForm) {
    if (form.valid) {
      this.result.emit(<OccupancyCodeModalResult>{ action: ModalFormEvent.Save, occupancyCode: this.occupancyCode });
    } else {
      this.showValidationError = true;
    }
  }

  dismiss() {
    this.result.emit(<OccupancyCodeModalResult>{});
  }
}
