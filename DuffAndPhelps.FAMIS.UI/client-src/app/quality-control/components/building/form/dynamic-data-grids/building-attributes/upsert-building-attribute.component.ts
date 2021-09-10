import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from '../../../../../../_core/services/helper.service';
import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { BuildingDto, BuildingAttributeDto } from '../../../../../../_api/_runtime/dtos/building.dto';
import { BuildingAttributeGridItemViewModel, BuildingAttributeModalResult } from '../../../../../../_models/building-form.model';
import { NgForm } from '@angular/forms';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';

@Component({
  selector: 'upsert-building-addition',
  templateUrl: './upsert-building-attribute.component.html'
})
export class UpsertBuildingAttributeComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input()
  modalTitle: string = null;
  @Input()
  buildingDto: BuildingDto;
  @Input()
  attribute: BuildingAttributeGridItemViewModel;

  selectedValues = new Array<BuildingAttributeDto>();
  valuesToDelete = new Array<BuildingAttributeDto>();

  result = new EventEmitter<BuildingAttributeModalResult>();

  showValidationError = false;

  constructor(private activeModal: NgbActiveModal, private helperService: HelperService) {}

  ngOnInit() {
    this.selectedValues = JSON.parse(JSON.stringify(this.attribute.selectedValues));

    if (this.attribute.selectedValues.length === 0) {
      this.add();
    }
  }

  save(form: NgForm) {
    if (form.valid) {
      this.result.emit(<BuildingAttributeModalResult>{
        action: ModalFormEvent.Save,
        selectedAttributes: this.selectedValues,
        attributesToDelete: this.valuesToDelete
      });

    } else {
      this.showValidationError = true;
    }
  }

  remove(index: number) {
    this.valuesToDelete.push(this.selectedValues[index]);
    this.selectedValues.splice(index, 1);
  }

  add() {
    this.selectedValues.push(<BuildingAttributeDto>{
      id: this.helperService.generateGuid(),
      buildingAttributeCodeId: '',
      value: null,
      attributeType: this.attribute.attributeType
    });
  }

  dismiss() {
    this.result.emit(<BuildingAttributeModalResult>{});
  }
}
