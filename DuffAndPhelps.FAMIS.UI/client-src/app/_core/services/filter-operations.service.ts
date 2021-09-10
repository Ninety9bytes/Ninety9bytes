import { Injectable } from '@angular/core';
import { FilterOperation } from '../../_models/filter-operation.model';
import { FieldType } from '../../_enums/field-type';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';

@Injectable()
export class FilterOperationsService {
  // Setting filter operations for each data type
  private integerOperations = ['eq', 'gt', 'lt', 'ge', 'le', 'ne', 'in', 'nin'];
  private doubleOperations = ['eq', 'gt', 'lt', 'ge', 'le', 'ne', 'in', 'nin'];
  private stringOperations = ['eq', 'ne', 'sw', 'ctns', 'nctns', 'in', 'nin'];
  private booleanOperations = ['eq', 'in', 'nin'];
  private dateTimeOperations = ['eq', 'gt', 'lt', 'ge', 'le', 'ne', 'in', 'nin'];
  private dropdownOperations = ['eq', 'ne'];
  private dropdownNullOperations = ['eq', 'ne', 'in', 'nin'];
  private reportStringOpertations = ['eq'];

  private operations = [
    <FilterOperation>{ name: 'eq', displayName: 'Equals' },
    <FilterOperation>{ name: 'gt', displayName: 'Is Greater Than' },
    <FilterOperation>{ name: 'lt', displayName: 'Is Less Than' },
    <FilterOperation>{ name: 'ge', displayName: 'Is Greater Than or Equal To' },
    <FilterOperation>{ name: 'le', displayName: 'Is Less Than or Equal To' },
    <FilterOperation>{ name: 'ne', displayName: 'Is Not Equal To' },
    <FilterOperation>{ name: 'ctns', displayName: 'Contains' },
    <FilterOperation>{ name: 'nctns', displayName: 'Not Contains' },
    <FilterOperation>{ name: 'in', displayName: 'Is Null' },
    <FilterOperation>{ name: 'nin', displayName: 'Is Not Null' },
    <FilterOperation>{ name: 'sw', displayName: 'Starts With' },
  ];

  constructor() { }

  // Gets filter operations for the given data type (int, double, string etc...)
  getOperationsForFieldType(fieldType: number, isNullable: boolean = false): Array<FilterOperation> {
    let operationsForType = new Array<FilterOperation>();

    const s = this;

    switch (fieldType) {
      case FieldType.Integer: {
        operationsForType = this.operations.filter(function (x) {
          return s.integerOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.Double: {
        operationsForType = this.operations.filter(function (x) {
          return s.doubleOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.String: {
        operationsForType = this.operations.filter(function (x) {
          return s.stringOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.Boolean: {
        operationsForType = this.operations.filter(function (x) {
          return s.booleanOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.DateTime: {
        operationsForType = this.operations.filter(function (x) {
          return s.dateTimeOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.Date: {
        operationsForType = this.operations.filter(function (x) {
          return s.dateTimeOperations.find(c => c === x.name);
        });
        break;
      }

      case FieldType.DropDown: {
        if(isNullable) {
          operationsForType = this.operations.filter(function (x) {
            return s.dropdownNullOperations.find(c => c === x.name);
          });
        }
        else {
          operationsForType = this.operations.filter(function (x) {
            return s.dropdownOperations.find(c => c === x.name);
          });
        }        
        break;
      }

      case FieldType.Image:{
        operationsForType = this.operations.filter(function(x) {
          return s.reportStringOpertations.find(c => c === x.name);
        });
        break;
      }

      default: {
        break;
      }
    }

    return operationsForType;
  }

  public mapKendoFilterOperation(kendoFilterOperation: string) {
    switch (kendoFilterOperation) {
      case 'lt':
        return 'lt';
      case 'lte':
        return 'le';
      case 'eq':
        return 'eq';
      case 'neq':
        return 'ne';
      case 'isnull':
        return 'in';
      case 'isnotnull':
        return 'nin';
      case 'contains':
        return 'ctns';
      case 'doesnotcontain':
        return 'nctns';
      case 'startswith':
        return 'sw';
      case 'gt':
        return 'gt';
      case 'gte':
        return 'ge';
      default:
        return 'notsupported';
    }
  }

  public updateFilter(filterModified: FilterDto, currentFilters: Array<FilterDto>): Array<FilterDto> {
    const index = currentFilters.findIndex(d => d.id === filterModified.id);
    if (index === -1) {
      currentFilters.push(filterModified);
    } else if (index >= 0) {
      currentFilters[index] = filterModified;
    }

    return currentFilters;
  }

  public removeFilter(id: string, currentFilters: Array<FilterDto>): Array<FilterDto> {
    const index = currentFilters.findIndex(d => d.id === id);
    if (index >= 0) {
      currentFilters.splice(index, 1);
    }
    return currentFilters;
  }
}
