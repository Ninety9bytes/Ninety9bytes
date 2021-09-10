import { HelperService } from '../../../_core/services/helper.service';
import { MassMatchService } from '../../services/mass-match/mass-match.service';
import { FilterOperationsService } from '../../../_core/services/filter-operations.service';
import { Component, OnInit, ComponentRef, EventEmitter, Output } from '@angular/core';
import { FieldMetaDataDto } from '../../../_api/_configuration/dtos/field-metadata.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';
import { FieldType } from '../../../_enums/field-type';
import { DataTargetName } from '../../../_enums/data-target-name';
import { FilterOperation } from '../../../_models/filter-operation.model';
import { FilterTermDto } from '../../../_api/dtos/inventory/filter-term.dto';

@Component({
  selector: 'filter-criteria-builder',
  templateUrl: './filter-criteria-builder.component.html'
})
export class FilterCriteriaBuilderComponent implements OnInit {
  ref: ComponentRef<FilterCriteriaBuilderComponent>;
  inventoryMetadata: Array<Array<FieldMetaDataDto>> = new Array<Array<FieldMetaDataDto>>();
  @Output() criteriaChangedEvent = new EventEmitter<FilterDto>();

  filter: FilterDto;
  selectedField: FieldMetaDataDto;

  sourceMetadata: Array<FieldMetaDataDto> = new Array<FieldMetaDataDto>();

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

  constructor(
    private helperService: HelperService,
    private massMatchService: MassMatchService,
    private filterOperationService: FilterOperationsService
  ) {}

  ngOnInit(): void {
    this.massMatchService.inventoryMetadata$.subscribe(inventoryMetadata => {
      if (inventoryMetadata) {
        this.inventoryMetadata = inventoryMetadata;

        if (!this.filter) {
          this.filter = <FilterDto>{ term: <FilterTermDto>{} };
          this.filter.id = this.helperService.generateGuid();
          this.filter.term.dataTarget = DataTargetName.client;
          this.sourceMetadata = this.inventoryMetadata[DataTargetName.client];
        } else {
          this.sourceMetadata = this.inventoryMetadata[this.filter.term.dataTarget];
          this.selectedField = this.sourceMetadata.find(c => c.name === this.filter.term.field);
          if(this.selectedField){
            this.operationsForSelectedTerm = this.filterOperationService.getOperationsForFieldType(this.selectedField.fieldType);
          }

        }
      }
    });
  }

  setSourceFile(dataTarget: number, event: any) {
    event.preventDefault();
    this.filter.term.dataTarget = dataTarget;

    this.sourceMetadata = this.inventoryMetadata[dataTarget];
  }

  initOperationAndValue() {
    this.filter.term.value = null;
    this.filter.operation = null;

    this.filter.term.field = this.selectedField.name;

    this.operationsForSelectedTerm = this.filterOperationService.getOperationsForFieldType(this.selectedField.fieldType);
  }

  criteriaChange() {
    this.massMatchService.addOrUpdateFilter(this.filter);
  }

  remove() {
    this.ref.destroy();
    this.massMatchService.removeFilter(this.filter);
  }
}
