import { HelperService } from '../../_core/services/helper.service';
import { FilterOperationsService } from '../../_core/services/filter-operations.service';
import { DatePipe } from '@angular/common';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ComponentRef, Input, Output, EventEmitter } from '@angular/core';
import { FieldMetaDataDto } from '../../_api/_configuration/dtos/field-metadata.dto';
import { DataTargetName } from '../../_enums/data-target-name';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';
import { FieldType } from '../../_enums/field-type';
import { FilterOperation } from '../../_models/filter-operation.model';
import { FilterTermDto } from '../../_api/dtos/inventory/filter-term.dto';

@Component({
  selector: 'filter-criteria-builder',
  templateUrl: './filter-criteria-builder.component.html'
})
export class FilterCriteriaBuilderComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  ref: ComponentRef<FilterCriteriaBuilderComponent>;
  @Input() filterMetadata = new Array<FieldMetaDataDto>();
  @Input() dataTarget: DataTargetName;
  @Input() translationKeyBase: string;
  @Output() criteriaChangedEvent = new EventEmitter<FilterDto>();
  @Output() filterRemovedEvent = new EventEmitter<FilterDto>();

  filter: FilterDto;
  selectedField: FieldMetaDataDto;

  fieldTypes = FieldType;
  dataTargetNames = DataTargetName;

  selectedSource: number = DataTargetName.client;

  operationsForSelectedTerm: Array<FilterOperation> = new Array<FilterOperation>();

  // Setting unique form field names
  formFieldNames = {
    sourceClientFile: 'selectedSourceClientFile' + this.helperService.generateGuid(),
    sourceInventoryFile: 'selectedSourceInventoryFile' + this.helperService.generateGuid(),
    selectedField: 'selectedField' + this.helperService.generateGuid(),
    selectedFilterType: 'selectedFilterType' + this.helperService.generateGuid(),
    value: 'value' + this.helperService.generateGuid()
  };

  constructor(private helperService: HelperService, private filterOperationService: FilterOperationsService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    if (!this.filter) {
      this.filter = <FilterDto>{ term: <FilterTermDto>{} };
      this.filter.id = this.helperService.generateGuid();
      this.filter.term.dataTarget = this.dataTarget ? this.dataTarget : DataTargetName.client;
    } else {
      this.selectedField = this.filterMetadata.find(c => c.name === this.filter.term.field);
      if (this.selectedField) {
        this.operationsForSelectedTerm = this.filterOperationService.getOperationsForFieldType(this.selectedField.fieldType);
      }
    }
  }

  initOperationAndValue() {
    this.filter.term.value = null;
    this.filter.operation = null;

    this.filter.term.field = this.selectedField.name;

    this.operationsForSelectedTerm = this.filterOperationService.getOperationsForFieldType(this.selectedField.fieldType);
  }

  filterOperationChange() {
    this.criteriaChangedEvent.emit(this.filter);
  }

  criteriaChange() {
    // If field is date, change format to match DB
    if (this.selectedField.fieldType === FieldType.DateTime) {
      this.filter.term.value.setTime(this.removeTimeZoneOffsetFromDate(this.filter.term.value));
    }

    this.criteriaChangedEvent.emit(this.filter);
  }

  private removeTimeZoneOffsetFromDate(date: Date) {
    const timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    return (date.getTime() - timeOffsetInMS);
  }

  remove() {
    this.ref.destroy();
    this.filterRemovedEvent.emit(this.filter);
  }
}
