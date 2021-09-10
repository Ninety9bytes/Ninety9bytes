import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { BaseFilterCellComponent, FilterService } from '@progress/kendo-angular-grid';

import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { HelperService } from '../../../_core/services/helper.service';
import { FilterOperationsService } from '../../../_core/services/filter-operations.service';
import { SinglePopupService, PopupCloseEvent } from '@progress/kendo-angular-grid';
import { FieldType } from '../../../_enums/field-type';
import { FilterDto } from '../../../_api/_runtime/dtos/filter.dto';
import { FilterOperation } from '../../../_models/filter-operation.model';
import { CompositeFilterDescriptor, FilterDescriptor } from '@progress/kendo-data-query';
import { EnumOptionDto } from '../../../_api/_configuration/dtos/enum-option.dto';

const closest = (node: any, predicate: any): any => {
  while (node && !predicate(node)) {
    node = node.parentNode;
  }

  return node;
};

@Component({
  selector: 'grid-filter',
  templateUrl: './grid-filter.component.html'
})
export class GridFilterComponent extends BaseFilterCellComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

   @ViewChild('filterList', { read: ElementRef, static: true }) filterListERef: ElementRef;

  fieldTypes = FieldType;

  famisFilter: FilterDto;

   @Output() filterChangeEvent = new EventEmitter<any>();

  operationsForSelectedTerm: Array<FilterOperation> = new Array<FilterOperation>();

  public get selectedValue(): any {
    const filter = this.filterByField(this.valueField);
    return filter ? filter.value : null;
  }

  formFieldNames = {
    sourceClientFile: 'selectedSourceClientFile' + this.helperService.generateGuid(),
    sourceInventoryFile: 'selectedSourceInventoryFile' + this.helperService.generateGuid(),
    selectedField: 'selectedField' + this.helperService.generateGuid(),
    selectedFilterType: 'selectedFilterType' + this.helperService.generateGuid(),
    value: 'value' + this.helperService.generateGuid()
  };

   @Input() public filter: CompositeFilterDescriptor;
   @Input() public textField: string;
   @Input() public valueField: string;
   @Input() public fieldType: number;
   @Input() public filterService: FilterService;
   @Input() public enumOptions: Array<EnumOptionDto>;
   @Input() public isNullable: boolean;

  public filterValue: any;
  public filterOperation: any;

  public filters: Array<CompositeFilterDescriptor | FilterDescriptor> = [
    {
      field: '',
      operator: '',
      value: ''
    }
  ];

  public get defaultItem(): any {
    return {
      [this.textField]: 'Select item...',
      [this.valueField]: null
    };
  }

  private filterIsClosed: boolean;

  private popupSubscription: any;

  constructor(
    filterService: FilterService,
    private helperService: HelperService,
    private filterOperationService: FilterOperationsService,
    private popupService: SinglePopupService
  ) {
    super(filterService);
  }

  ngOnInit(): void {
    this.operationsForSelectedTerm = this.filterOperationService.getOperationsForFieldType(this.fieldType, this.isNullable);

    if (this.filter.filters.length > 0) {
      const f = this.filter.filters.find(c => c['field'] === this.valueField);
      const filter = <FilterDescriptor>f;

      if (this.fieldType === this.fieldTypes.Date ||
          this.fieldType === this.fieldTypes.DateTime ||
          this.fieldType === this.fieldTypes.DateWithTimeStamp) {
        if (Array.isArray(filter.value)) {
          filter.value.forEach(value => {
            if (!isNaN(Date.parse(value.value))) {
              const dateValue = new Date(value.value);
              if (dateValue.getHours() !== 0 ||
                  dateValue.getMinutes() !== 0 ||
                  dateValue.getSeconds() !== 0 ||
                  dateValue.getMilliseconds() !== 0) {
                dateValue.setTime(this.addTimeZoneOffsetToDate(dateValue));
              }
              value.value = dateValue;
            }
          });
        }
      }

      this.filters = Array.isArray(filter.value) ? filter.value : [filter];
    }

    this.popupSubscription = this.popupService.onClose.subscribe((e: PopupCloseEvent) => {
      if (e.originalEvent.path.findIndex(c => c.tagName === 'KENDO-POPUP') >= 0) {
        e.preventDefault();
      }
    });
    console.log(this.filter.filters.filter(c => c['field'] === this.valueField), 'Current Filter');
  }

  public onChange(event?: any): void {
    const selectedFilters = [];

    this.removeFilter(this.valueField);

    this.filters.forEach(f => {
      const filter = <FilterDescriptor>f;

      if (filter.operator) {
        if (filter.operator === 'in' || filter.operator === 'nin') {
          filter.value = null;
        }

        if (event instanceof Date) {
          event.setHours(0, 0, 0, 0);
          filter.value.setTime(this.removeTimeZoneOffsetFromDate(event));
        }

        filter.field = this.valueField;
        
        if(this.fieldType != FieldType.DropDown || 
          (this.fieldType == FieldType.DropDown && (filter.value ||
          (filter.operator === 'in' || filter.operator === 'nin'))))
          selectedFilters.push(filter);
      }
    });

    if (selectedFilters.length > 0) {
      this.applyFilter(
        this.updateFilter({
          field: this.valueField,
          operator: '0',
          value: selectedFilters
        })
      );
    }
  }

  public addFilter(event) {
    event.preventDefault();
    this.filters.push({
      field: '',
      operator: '',
      value: ''
    });
  }

  closeFilter() {
    this.filterIsClosed = true;
  }

  remove(event: any, index: number) {
    event.preventDefault();

    if (this.filters.length > 1) {
      this.filters.splice(index, 1);
      this.onChange();
    }
  }

  private removeTimeZoneOffsetFromDate(date: Date) {
    const timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    return (date.getTime() - timeOffsetInMS);
  }

  private addTimeZoneOffsetToDate(date: Date) {
    const timeOffsetInMS: number = date.getTimezoneOffset() * 60000;
    return (date.getTime() + timeOffsetInMS);
  }
}
