import { HelperService } from '../../../../../../_core/services/helper.service';
import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { AdditionalDataGridService } from '../../../../../services/additional-data/additional-data-grid.service';
import { BuildingSelectedAdjustment, BuildingDto, BuildingSelectedAddition } from '../../../../../../_api/_runtime/dtos/building.dto';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BuildingAdditionField, BuildingAdditionFormResult } from '../../../../../../_models/building-addition-view.model';
import { ReferenceBuildingAdditionGroupDto, ReferenceBuildingAdditionCategoryDto, ReferenceBuildingAdditionCriterionDto,
  ReferenceBuildingAdjustmentDto } from '../../../../../../_api/_configuration/dtos/reference-building-addition-group.dto';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';
import { FormGroup, NgForm } from '@angular/forms';
import { FieldType } from '../../../../../../_enums/field-type';
import { IntlService } from '@progress/kendo-angular-intl';

@Component({
  selector: 'upsert-building-addition',
  templateUrl: './upsert-building-addition.component.html'
})
export class UpsertBuildingAdditionComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  showValidationError = false;

  selectedCategoryId = '';
  selectedGroupId = '';
  selectedQuantity;

  @Input()
  hideSubmit = false;
  @Input()
  modalTitle: string = null;
  @Input()
  buildingDto: BuildingDto;
  @Input()
  addition: BuildingSelectedAddition;
  @Input()
  referenceData: Array<BuildingAdditionField>;
  @Input()
  groups = new Array<ReferenceBuildingAdditionGroupDto>();

  @Output()
  modalEvent = new EventEmitter<ModalFormEvent>();

  categories = new Array<ReferenceBuildingAdditionCategoryDto>();

  criteriaForCategory = new Array<Array<ReferenceBuildingAdditionCriterionDto>>();
  adjustmentsForCategory = new Array<ReferenceBuildingAdjustmentDto>();

  criteriaFormGroup: FormGroup;

  formControlTypes = FieldType;

  initialCriteria = new Array<BuildingSelectedAddition>();

  selectedCriteria = new Array<BuildingSelectedAddition>();
  selectedAdjustments = new Array<BuildingSelectedAdjustment>();

  result = new EventEmitter<BuildingAdditionFormResult>();

  action: ModalFormEvent;


  constructor(
    private intl: IntlService,
    private helperService: HelperService,
    private additionalDataGridService: AdditionalDataGridService
  ) {}

  ngOnInit() {

    let selectedCriteria = this.referenceData.find(c => c.criteria.id === this.addition.referenceBuildingAdditionCriterionId);

    if (selectedCriteria) {
      this.selectedGroupId = selectedCriteria.groupDto.id;
      this.selectedCategoryId = selectedCriteria.categoryDto.id;

      this.setCategories();
      this.setCriteriaAndAdjustments();

      this.setValue(this.addition, selectedCriteria);

      let currentAddition = this.additionalDataGridService.getAdditionById(this.addition.childAdditionCriterionId);

      while (currentAddition) {
        selectedCriteria = this.referenceData.find(c => c.criteria.id === currentAddition.referenceBuildingAdditionCriterionId);

        this.setValue(currentAddition, selectedCriteria);

        currentAddition = this.additionalDataGridService.getAdditionById(currentAddition.childAdditionCriterionId);
      }
      this.initialCriteria = this.selectedCriteria;
    }
    if (this.selectedQuantity == null) {
       this.selectedQuantity = 1;
    }
  }

  dismiss() {
    this.result.emit(<BuildingAdditionFormResult>{ action: ModalFormEvent.Dismiss });
  }

  save(form: NgForm) {
    if (form.valid) {
      const s = this;

      let criteriaToDelete = new Array<BuildingSelectedAddition>();

      criteriaToDelete = this.initialCriteria.filter(function(x) {
        return s.selectedCriteria.findIndex(c => !!c && c.id === x.id) === -1;
      });

      if (this.selectedCriteria.length > 1) {
        if (this.selectedCriteria[1]) {
          this.selectedCriteria[1].buildingSelectedAdjustments = Object.assign([], this.selectedAdjustments);
          this.selectedCriteria[1].quantity = this.selectedQuantity;
        }
      } else {
        if (this.selectedCriteria[0]) {
          this.selectedCriteria[0].buildingSelectedAdjustments = Object.assign([], this.selectedAdjustments);
          this.selectedCriteria[0].quantity = this.selectedQuantity;
        }
      }
      this.result.emit(<BuildingAdditionFormResult>{
        action: ModalFormEvent.Save,
        criterion: this.selectedCriteria,
        criteriaToDelete: criteriaToDelete
      });
    } else {
      this.showValidationError = true;
    }
  }

  changeGroup() {
    this.selectedCategoryId = undefined;
    this.criteriaForCategory = new Array<any>();
    this.selectedCriteria = new Array<BuildingSelectedAddition>();
    this.adjustmentsForCategory = new Array<ReferenceBuildingAdjustmentDto>();
    this.selectedAdjustments = new Array<BuildingSelectedAdjustment>();

    this.setCategories();
  }

  setCategories() {
    const group = this.groups.find(c => c.id === this.selectedGroupId);

    if (group) {
      this.categories = group.referenceBuildingAdditionCategoryDtos;
    }
  }

  setCriteriaAndAdjustments() {
    this.criteriaForCategory = new Array<any>();
    this.selectedCriteria = new Array<BuildingSelectedAddition>();
    this.adjustmentsForCategory = new Array<ReferenceBuildingAdjustmentDto>();
    this.selectedAdjustments = new Array<BuildingSelectedAdjustment>();

    const category = this.categories.find(c => c.id === this.selectedCategoryId);

    if (category) {
      this.criteriaForCategory = this.helperService.groupBy(category.referenceBuildingAdditionCriterionDtos, 'index');

      this.criteriaForCategory.forEach(option => {
        this.selectedCriteria[option[0].index] = {
          id: this.helperService.generateGuid(),
          buildingId: this.buildingDto.id,
          referenceBuildingAdditionCriterionId: option[0].id,
          childAdditionCriterionId: null,
          buildingSelectedAdjustments: new Array<BuildingSelectedAdjustment>(),
          criterionValue: null,
          quantity: null,
          totalCost: null
        };
      });

      this.adjustmentsForCategory = category.referenceBuildingAdditionAdjustmentDtos.map(c => c.referenceBuildingAdjustmentDto);

      category.referenceBuildingAdditionAdjustmentDtos.forEach(aa => {
        this.selectedAdjustments.push(<BuildingSelectedAdjustment>{
          id: this.helperService.generateGuid(),
          referenceBuildingAdditionAdjustmentId: aa.id,
          value: null
        });
      });
    }
  }

  private setValue(criteria: BuildingSelectedAddition, referenceItem: BuildingAdditionField) {
    if (criteria.buildingSelectedAdjustments) {
      for (let i = 0; i < this.selectedAdjustments.length; i++) {
        const existing = criteria.buildingSelectedAdjustments
        .find(b => b.referenceBuildingAdditionAdjustmentId === this.selectedAdjustments[i].referenceBuildingAdditionAdjustmentId);
        if (existing) {
          this.selectedAdjustments[i] = existing;
        }
      }
    }

    if (criteria.quantity != null) {
      this.selectedQuantity = criteria.quantity;
    }

    this.selectedCriteria[referenceItem.criteria.index] = {
      id: criteria.id,
      buildingId: this.buildingDto.id,
      referenceBuildingAdditionCriterionId: criteria.referenceBuildingAdditionCriterionId,
      childAdditionCriterionId: criteria.childAdditionCriterionId,
      buildingSelectedAdjustments: new Array<BuildingSelectedAdjustment>(),
      criterionValue: null,
      quantity: criteria.quantity,
      totalCost: criteria.totalCost
    };
    if (!!criteria.criterionValue) {
      this.selectedCriteria[referenceItem.criteria.index].criterionValue = this.intl.parseNumber(criteria.criterionValue, 'n', 'en');
    }
  }
}
