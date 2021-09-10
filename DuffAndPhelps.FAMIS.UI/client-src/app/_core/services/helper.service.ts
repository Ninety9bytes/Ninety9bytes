import { AbstractControl, FormControl, Validators, FormGroup } from '@angular/forms';
import * as mjs from 'mathjs';
import { TranslationManager } from '../i18n/translation-manager';
import { Injectable } from '@angular/core';
import { IntlService } from '@progress/kendo-angular-intl';
import { FieldType } from '../../_enums/field-type';
import { Asset } from '../../_models/asset.model';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { FieldMetaDataDto } from '../../_api/_configuration/dtos/field-metadata.dto';
import { MassUpdateRequestAdvancedTermDto } from '../../_api/_runtime/dtos/mass-update-request-advanced-term.dto';
import { AdvancedMathType } from '../../_api/_runtime/enums/advanced-math-type';
import { AdvancedMathOperator } from '../../_api/_runtime/enums/advanced-math-operator';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';

@Injectable()
export class HelperService {
  constructor(private intl: IntlService, private translateService: TranslationManager) {}

  public generateGuid() {
    let d = new Date().getTime();
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return guid;
  }

  public getHeaders(obj, hiddenColumns: Array<string> = new Array<string>()): Array<GridColumnHeader> {
    const headers = new Array<GridColumnHeader>();
    if (obj) {
      const keys = Object.keys(obj).map(key => {
        return { key: key };
      });

      keys.forEach(k => {
        if (hiddenColumns && !hiddenColumns.includes(k.key)) {
          headers.push(<GridColumnHeader>{ name: k.key });
        }
      });

      return headers;
    }
  }

  public lowerCasePropertyName(name: string): string {
    if (name == null) {
      return null;
    }

    if (name.length >= 1) {
      return name.charAt(0).toLowerCase() + name.slice(1, name.length);
    } else {
      return name.charAt(0).toLowerCase();
    }
  }

  public upperCasePropertyName(name: string): string {
    if (name == null) {
      return null;
    }

    if (name.length >= 1) {
      return name.charAt(0).toUpperCase() + name.slice(1, name.length);
    } else {
      return name.charAt(0).toUpperCase();
    }
  }

  public initDate(date: Date): Date {
    return date > new Date('1/1/1') ? date : null;
  }

  public mapHeaders(
    fields: FieldMetaDataDto[],
    hiddenColumns: string[],
    defaultColumns: Array<GridColumnHeader> = new Array<GridColumnHeader>(),
    enumDtos?: Array<EnumDto>
  ): GridColumnHeader[] {
    const s = this;
    const columnHeadings = new Array<GridColumnHeader>();

    defaultColumns.forEach(column => {
      fields.find(c => c.name === column.name).order = column.order;
    });

    let orderCount = 1;
    fields.forEach(field => {
      let enumDto = enumDtos ? enumDtos.find(e => e.enumName.toLowerCase() == field.name.toLowerCase()) : undefined;
      const columnHeading = <GridColumnHeader>{
        name: field.name,
        displayName: field.displayName,
        isSearchable: field.isSearchable,
        isFilterable: field.isFacetable,
        isSortable: field.isSortable,
        isFacetable: field.isFacetable,
        isKey: field.isKey,
        isCustom: field.isCustom,
        isEditable: field.inGridEditable,
        // fieldType: this.mapKendoFilterType(field.fieldType),
        fieldType: field.fieldType,
        format: s.mapHeaderFormat(field),
        order: field.order ? field.order : defaultColumns.length + orderCount,
        enumOptions: enumDto ? enumDto.enumOptions : undefined,
        isNullable: field.isNullable
      };

      columnHeadings.push(columnHeading);

      orderCount++;
    });

    return columnHeadings.filter(function(x) {
      return hiddenColumns.findIndex(c => c === x.name) === -1;
    });
  }

  public toFormGroup(fields: any[]) {
    const controls: { [key: string]: AbstractControl } = {};

    fields.forEach(field => {
      controls[field.id] = field.required ? new FormControl(field.value, Validators.required) : new FormControl(field.value);
    });
    return new FormGroup(controls);
  }

  public move(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      let k = new_index - arr.length;
      while (k-- + 1) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }

  private mapKendoFilterType(fieldType: FieldType): string {
    switch (fieldType) {
      case FieldType.String:
        return 'text';
      case FieldType.DateTime:
        return 'date';
      case FieldType.Double:
        return 'numeric';
      case FieldType.Integer:
        return 'numeric';
      case FieldType.Image:
        return 'image';
      default:
        return 'numeric';
    }
  }

  private mapHeaderFormat(header: FieldMetaDataDto): string {
    switch (header.fieldType) {
      case FieldType.Integer: {
        return '0';
      }

      case FieldType.Double: {
        return 'n';
      }

      case FieldType.DateTime: {
        return 'd';
      }

      default: {
        return '0';
      }
    }
  }

  mapDates(dataItem: Asset, fields: Array<FieldMetaDataDto>): Asset {
    const props = Object.keys(dataItem);

    const dateFields = fields.filter(c => c.fieldType === FieldType.DateTime);

    props.forEach(property => {
      if (dateFields.findIndex(c => c.name === property) !== -1) {
        const date = this.intl.parseDate(dataItem[property]);

        dataItem[property] = date;
      }
    });

    return dataItem;
  }

  public sortCollection(collection: any, sortField: string, direction?: string): Array<any> {
    if (collection.length === 0) {
      return collection;
    }

    if (isNaN(collection[0][sortField])) {
      // Sort by string value
      collection.sort((a: any, b: any) => {
        if (a[sortField] < b[sortField]) {
          return !direction || direction.toLowerCase() === 'asc' ? -1 : 1;
        } else if (a[sortField] > b[sortField]) {
          return !direction || direction.toLowerCase() === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    if (!isNaN(collection[0][sortField])) {
      // Sort by numeric value
      collection.sort((a: any, b: any) => {
        if (Number.parseFloat(a[sortField]) < Number.parseFloat(b[sortField])) {
          return !direction || direction.toLowerCase() === 'asc' ? -1 : 1;
        } else if (Number.parseFloat(a[sortField]) > Number.parseFloat(b[sortField])) {
          return !direction || direction.toLowerCase() === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    if (Array.isArray(collection[0][sortField])) {
      collection.sort((a: any, b: any) => {
        // Sort by multi value
        if (a[sortField].length < b[sortField].length) {
          return !direction || direction.toLowerCase() === 'asc' ? -1 : 1;
        } else if (a[sortField].length > b[sortField].length) {
          return !direction || direction.toLowerCase() === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }

    return collection;
  }

  public getColumnTitle(translationKeyBase: string, column: GridColumnHeader): string {
    if (!column.isCustom) {
      return this.translateService.instant(translationKeyBase + column.displayName);
    }

    return column.displayName;
  }

  public convertMathTree(tree: mjs.MathNode): MassUpdateRequestAdvancedTermDto {
    const mathTree = <MassUpdateRequestAdvancedTermDto>{};

    if (tree.isConstantNode) {
      mathTree.type = AdvancedMathType.Constant;
      mathTree.operator = AdvancedMathOperator.Noop;
      mathTree.value = tree.value;
      mathTree.leftTerm = null;
      mathTree.rightTerm = null;
    }

    if (tree.isSymbolNode) {
      mathTree.type = AdvancedMathType.Field;
      mathTree.operator = AdvancedMathOperator.Noop;
      mathTree.value = tree.name;
      mathTree.leftTerm = null;
      mathTree.rightTerm = null;
    }

    if (tree.isOperatorNode) {
      mathTree.type = AdvancedMathType.Compound;
      mathTree.value = null;
      mathTree.operator = this.getOperator(tree.fn);
      mathTree.leftTerm = this.convertMathTree(tree.args[0]);
      mathTree.rightTerm = this.convertMathTree(tree.args[1]);
    }

    if (!tree.isConstantNode && !tree.isOperatorNode && !tree.isSymbolNode) {
      mathTree.type = AdvancedMathType.Compound;
      mathTree.value = null;
      mathTree.operator = this.getOperator(tree['content'].fn);
      mathTree.leftTerm = this.convertMathTree(tree['content'].args[0]);
      mathTree.rightTerm = this.convertMathTree(tree['content'].args[1]);
    }

    return mathTree;
  }

  public groupBy(values, key) {
    const s = this;

    const groupedResult = values.reduce(function(reducedValue, x) {
      (reducedValue[x[key]] = reducedValue[x[key]] || []).push(x);
      return reducedValue;
      // s.categoryCriteria.push(reducedValue);
    }, {});

    return Object.keys(groupedResult)
      .sort()
      .map(function(k) {
        return groupedResult[k];
      });
  }

  private getOperator(operator: string): AdvancedMathOperator {
    switch (operator) {
      case 'add':
        return AdvancedMathOperator.Add;
      case 'multiply':
        return AdvancedMathOperator.Multiply;
      case 'divide':
        return AdvancedMathOperator.Divide;
      case 'subtract':
        return AdvancedMathOperator.Subtract;
    }
  }
}
