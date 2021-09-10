
import {map} from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';
import { ReconciliationConstants } from '../reconciliation.constants';
import { Injectable } from '@angular/core';
import { ConsolidationColumn } from '../../_models/reconciliation/consolidation-column.model';
import { ConsolidationColumnOverride } from '../../_models/reconciliation/consolidation-column-override.model';
import { DataTargetName } from '../../_enums/data-target-name';
import { InventoryService } from '../../_api/services/reconciliation/inventory.service';
import { AssetFileSummaryDto } from '../../_api/dtos/asset-file-summary.dto';
import { ConsolidatedFileColumnMapDto } from '../../_api/dtos/consolidated-file-column-map.dto';
import { FieldMetaDataDto } from '../../_api/dtos/inventory/field-meta-data.dto';
import { MatchCodeColumnMapDto } from '../../_api/dtos/reconciliation/match-code-column-map.dto';
import { MatchCodeColumnMappingOverrideDto } from '../../_api/dtos/reconciliation/match-code-column-mapping-override.dto';
import { ValidationResult } from '../../_models/validation-result.model';
import { FieldType } from '../../_enums/field-type';
import { SelectOption } from '../../_models/select-option.model';

@Injectable()
export class ConsolidationService {

  defineLayoutDirty = false;
  mapMatchCodesDirty = false;

  private _clientFieldList = new BehaviorSubject<Array<ConsolidationColumn>>(
    new Array<ConsolidationColumn>()
  );
  public clientFields = this._clientFieldList.asObservable();

  private _inventoryFieldList = new BehaviorSubject<
    Array<ConsolidationColumn>
  >(new Array<ConsolidationColumn>());
  public inventoryFields = this._inventoryFieldList.asObservable();

  private _selectedFieldList = new BehaviorSubject<
    Array<ConsolidationColumn>
  >(new Array<ConsolidationColumn>());
  public selectedFields = this._selectedFieldList.asObservable();

  private _columnOverrides = new BehaviorSubject<
    Array<ConsolidationColumnOverride>
  >(new Array<ConsolidationColumnOverride>());
  public columnOverrides = this._columnOverrides.asObservable();

  private _availableDestinationList = new BehaviorSubject<
    Array<ConsolidationColumn>
  >(new Array<ConsolidationColumn>());
  public availableDestinationList = this._availableDestinationList.asObservable();
  private _defaultColumns: Array<ConsolidationColumn> = [];

  private hiddenColumns = new Array<string>();

  private _groupId: string;
  constructor(private inventoryService: InventoryService) {
    this.hiddenColumns = ReconciliationConstants.hiddenColumns.concat(ReconciliationConstants.hiddenColumnsLayoutMapping);
  }

  public ExcludedMappedColumns = [
    'historicalCost',
    'customColumns',
    'depreciationMethod',
    'depreciationConvention'
  ];

  public initialize(groupId: string) {
    this._groupId = groupId;
    this.clearData();

    this.inventoryService.getAssetFileSearchMetadata(DataTargetName.inventory)
    .subscribe(availableColumns => {
      this.loadAvailableColumns(availableColumns);

      this.inventoryService
      .getAssetFileSummary(this._groupId, DataTargetName.client)
      .subscribe(clientResult => {
        const clientColumns = this.mapColumnsToDisplayFromApiResult(clientResult, DataTargetName.client);

        this.inventoryService
          .getAssetFileSummary(groupId, DataTargetName.inventory)
          .subscribe(inventoryResult => {
            const inventoryColumns = this.mapColumnsToDisplayFromApiResult(inventoryResult, DataTargetName.inventory);

            this.inventoryService.getConsolidatedColumnMappings(this._groupId)
            .subscribe(mappingResults =>  {
              this.saveSelectedMappingsFromApi(mappingResults.result, clientColumns, inventoryColumns);

            });
          });
      });
    });

    this.inventoryService.getConsolidatedColumnAssignments(this._groupId)
    .subscribe(overrideResult => {
      const overrides = this.mapOverrideDtoToModel(overrideResult.result);
      this._columnOverrides.next(overrides);
    });
  }

  private clearData() {
    this._clientFieldList.next([]);
    this._inventoryFieldList.next([]);
    this._selectedFieldList.next([]);
    this._columnOverrides.next([]);
    this._availableDestinationList.next([]);
    this._defaultColumns = [];
  }

  private mapColumnsToDisplayFromApiResult(assetFileSummaryDto: AssetFileSummaryDto,
    dataTarget: DataTargetName): ConsolidationColumn[] {
    // tslint:disable-next-line:prefer-const
    let columns = assetFileSummaryDto.fields
      .map<ConsolidationColumn>(dto => this.mapFieldDtoToColumn(dto, dataTarget))
      .filter(
        column =>
          !this.hiddenColumns.some(
            h => h.toLowerCase() === column.sourceColumn.toLowerCase()
          )
      );
    columns.push(this.getAccountColumn(dataTarget));
    return columns;
  }

  private saveSelectedMappingsFromApi(
    mappings: Array<ConsolidatedFileColumnMapDto>,
    clientColumns: ConsolidationColumn[],
    inventoryColumns: ConsolidationColumn[]
  ) {
    if (mappings && mappings.length > 0) {
      mappings.forEach(map => {
        let target: ConsolidationColumn[];
        if (map.source === DataTargetName.client) {
          target = clientColumns;
        } else if (map.source === DataTargetName.inventory) {
          target = inventoryColumns;
        }

        const index = target.findIndex(c => c.sourceColumn === map.name && c.sourceTarget === map.source);
        if (index !== -1) {
          target[index].id = map.id;
          target[index].displayName = map.displayName;
          target[index].selected = true;
          target[index].destinationColumnName = map.destinationColumnName;
        }
      });

    }

    this._clientFieldList.next(clientColumns);
    this._inventoryFieldList.next(inventoryColumns);

    this.selectColumns(clientColumns.filter(column => column.selected));
    this.selectColumns(inventoryColumns.filter(column => column.selected));

    this.reconcileAvailableColumns();
}

  private mapFieldDtoToColumn(
    fieldDto: FieldMetaDataDto,
    dataTarget: DataTargetName
  ): ConsolidationColumn {
    const result: ConsolidationColumn = {
      id: null,
      selected: false,
      sourceTarget: dataTarget,
      sourceColumn: fieldDto.name,
      destinationColumnName: null,
      displayName: fieldDto.displayName,
      fieldType: fieldDto.fieldType,
      isCustom: fieldDto.isCustom
    };
    return result;
  }

  public getColumns(dataTarget: DataTargetName): Observable<Array<ConsolidationColumn>> {
    if (dataTarget === DataTargetName.client) {
      return this.clientFields;
    } else if (dataTarget === DataTargetName.inventory) {
      return this.inventoryFields;
    }
  }

  public getSelectedColumns(): Observable<Array<ConsolidationColumn>> {
    return this.selectedFields;
  }

  public getSelectedColumn(columnId: string): ConsolidationColumn {
    return this._selectedFieldList.getValue().find(x => x.id === columnId);
  }

  public getDefaultColumns(): Array<ConsolidationColumn> {
    const result = [];
    this._defaultColumns.forEach(c => result.push(<ConsolidationColumn> {
      id: c.id,
      sourceTarget: c.sourceTarget,
      sourceColumn: c.sourceColumn,
      fieldType: c.fieldType,
      displayName: c.displayName,
      destinationColumnName: c.destinationColumnName
    }));
    return result;
  }

  private setDefaultColumns(columns: Array<ConsolidationColumn>): void {
    this._defaultColumns = [];
    columns.forEach(c => this._defaultColumns.push(<ConsolidationColumn> {
      id: c.id,
      sourceTarget: c.sourceTarget,
      sourceColumn: c.sourceColumn,
      fieldType: c.fieldType,
      displayName: c.displayName,
      destinationColumnName: c.destinationColumnName
    }));
  }

  private updateColumn(column: ConsolidationColumn) {
    const currentClient = this._clientFieldList.getValue();
    const currentInventory = this._inventoryFieldList.getValue();

    if (column.sourceTarget === DataTargetName.client) {
      const clientIndex = currentClient.findIndex(
        item => item.sourceColumn === column.sourceColumn && item.sourceTarget === column.sourceTarget
      );
      if (clientIndex !== -1) {
        currentClient[clientIndex].selected = column.selected;
      }
      this._clientFieldList.next(currentClient);
    }
    if (column.sourceTarget === DataTargetName.inventory) {
      const inventoryIndex = currentInventory.findIndex(
        item => item.sourceColumn === column.sourceColumn && item.sourceTarget === column.sourceTarget
      );
      if (inventoryIndex !== -1) {
        currentInventory[inventoryIndex].selected = column.selected;
      }
      this._inventoryFieldList.next(currentInventory);
    }
  }

  public selectColumns(columns: ConsolidationColumn[]) {
    let current = this._selectedFieldList.getValue();
    columns.forEach(column => {
      column.selected = true;
      // add the items to the selected list
      const selectedIndex = current.findIndex(
        c => c.sourceColumn === column.sourceColumn && c.sourceTarget === column.sourceTarget
      );
      if (selectedIndex === -1) {
        current.push(column);
      }
      this.updateColumn(column);
    });

    current = current.sort((a, b) => {
      if (a.sourceColumn > b.sourceColumn) {
        return 1;
      }
      if (a.sourceColumn < b.sourceColumn) {
        return -1;
      }
      return a.sourceTarget - b.sourceTarget;
    });
    this._selectedFieldList.next(current);
  }

  public deselectColumns(columns: ConsolidationColumn[]) {
    const current = this._selectedFieldList.getValue();
    columns.forEach(column => {
      const index = current.findIndex(
        c => c.sourceColumn === column.sourceColumn && c.sourceTarget === column.sourceTarget
      );
      if (index !== -1) {
        current.splice(index, 1);
      }
      column.selected = false;
      column.destinationColumnName = null;
      this.updateColumn(column);
    });
    this._selectedFieldList.next(current);
    this.reconcileAvailableColumns();
  }

  public updateSelectedColumn(column: ConsolidationColumn) {
    const current = this._selectedFieldList.getValue();
    const index = current.findIndex(
      c => c.sourceColumn === column.sourceColumn && c.sourceTarget === column.sourceTarget
    );
    if (index !== -1) {
      current[index].displayName = column.displayName;
    }
  }

  public saveColumnMappingSettings(): Observable<Array<ConsolidationColumn>> {
    const columns = this._selectedFieldList.getValue().map(column => <ConsolidatedFileColumnMapDto> {
      id: column.id == null ? null : column.id,
      source: column.sourceTarget,
      name: column.sourceColumn,
      displayName: column.displayName,
      destinationColumnName: column.destinationColumnName,
      order: 0,
    });
    return this.inventoryService.updateConsolidatedColumnMappings(this._groupId, columns).pipe(
    map(result => <ConsolidationColumn[]> result.result.map(column => <ConsolidationColumn> {
      id: column.id,
      sourceTarget: column.source,
      sourceColumn: column.name,
      displayName: column.displayName,
      destinationColumnName: column.destinationColumnName
    })));
  }

  public saveColumnMappingAssignments(): Observable<Array<ConsolidationColumnOverride>> {
    const overrides = this._columnOverrides.getValue();
    const dtos = this.mapOverrideModelToDto(this._selectedFieldList.getValue(), overrides);
    const subscription = this.inventoryService.updateConsolidatedColumnAssignments(this._groupId, dtos).pipe(
    map(apiResult => {
      if (apiResult.code === 0) {
        const results = this.mapOverrideDtoToModel(apiResult.result);
        this._columnOverrides.next(results);
        return results;
      }
      return [];
    }));
    return subscription;
  }

  private mapOverrideDtoToModel(dtos: Array<MatchCodeColumnMapDto>): Array<ConsolidationColumnOverride> {
    const results = new Array<ConsolidationColumnOverride>();
    dtos.forEach(column => {
      column.matchCodeOverrides.forEach(override => {
        results.push(<ConsolidationColumnOverride> {
          id: override.id,
          matchCodeId: override.matchCodeId,
          columnName: override.name,
          source: override.source,
          consolidationColumnId: column.id,
          });
      });
    });
    return results;
  }

  private mapOverrideModelToDto(columns: Array<ConsolidationColumn>, overrides: Array<ConsolidationColumnOverride>)
    : Array<MatchCodeColumnMapDto> {
    return columns.map(field => <MatchCodeColumnMapDto> {
      id: field.id,
      source: field.sourceTarget,
      name: field.sourceColumn,
      order: 0,
      displayName: field.displayName,
      destinationColumnName: field.destinationColumnName,
      matchCodeOverrides: overrides.filter(o => o.consolidationColumnId === field.id).map(x => <MatchCodeColumnMappingOverrideDto> {
        id: x.id,
        matchCodeId: x.matchCodeId,
        source: x.source,
        name: x.columnName
      })
    });
  }

  public setColumnDestination(column: ConsolidationColumn, destination: string): ValidationResult {
    const fields = this._selectedFieldList.getValue();

    if (destination != null && destination.length > 0) {
      // check for duplicates
      const duplicate = fields
        .filter(x => x.destinationColumnName != null || x.destinationColumnName !== '')
        .findIndex(x => (x.destinationColumnName != null && x.destinationColumnName.toLowerCase() === destination.toLowerCase())
          && (x.sourceTarget !== column.sourceTarget || x.sourceColumn !== column.sourceColumn));
      if (duplicate !== -1) {
        return <ValidationResult> {
          success: false,
          message: `The column '${destination}' is already in use.`
        };
      }
      const regex = new RegExp('^[a-zA-Z0-9_-]*$');
      if (regex.test(destination) === false) {
        return <ValidationResult> {
          success: false,
          message: 'Spaces and special characters are not allowed.'
        };
      }
      if (destination.toLowerCase() === 'historicalcost') {
        return <ValidationResult> {
          success: false,
          message: 'Historical Cost is not a valid custom column name.'
        };
      }

    }

    const original = fields.find(x =>  x.sourceTarget === column.sourceTarget && x.sourceColumn === column.sourceColumn);
    if (original == null) {
      return <ValidationResult> {
        success: false,
        message: 'Unknown column'
       };
    }
    original.destinationColumnName = destination;

    this._selectedFieldList.next(fields);
    this.reconcileAvailableColumns();

    return  <ValidationResult> { success: true };
  }

  private reconcileAvailableColumns() {
    this._availableDestinationList.next(this.getDefaultColumns());

    this._selectedFieldList.subscribe(fields => {
      if (fields == null || fields.length === 0) {
        return;
      }
      fields
        .filter(x => x.destinationColumnName != null || x.destinationColumnName !== '')
        .forEach(selected => { this.removeAvailableColumn(selected.destinationColumnName); });
    });
  }

  private loadAvailableColumns(apiResult: AssetFileSummaryDto) {
    // tslint:disable-next-line:prefer-const
    let columns = apiResult.fields
      .filter(column => !this.hiddenColumns.some(h => h.toLowerCase() === column.name.toLowerCase()))
      .filter(column => this.ExcludedMappedColumns.indexOf(column.name) === -1)
      .map(f => <ConsolidationColumn> {
        id: null,
        sourceTarget: DataTargetName.consolidated,
        sourceColumn: f.name,
        displayName: f.displayName,
        fieldType: f.fieldType,
        destinationColumnName: f.name,
        isCustom: f.isCustom
      });
      columns.push(this.getAccountColumn(DataTargetName.consolidated));
    this._availableDestinationList.next(columns);
    this.setDefaultColumns(columns);
    this.reconcileAvailableColumns();
  }

  private removeAvailableColumn(sourceColumnName: string) {
    const columns = this._availableDestinationList.getValue();
    const index = columns.findIndex(a => a.sourceColumn === sourceColumnName);
    if (index !== -1) {
      columns.splice(index, 1);
      this._availableDestinationList.next(columns);
    }
  }


  private autoMapColumn(column: ConsolidationColumn) {
    const available = this._availableDestinationList.getValue();
    const fields = this._selectedFieldList.getValue();
    const index = available.findIndex(a => a.sourceColumn === column.sourceColumn);
    if (index !== -1) {
      const original = fields
        .findIndex(f => f.sourceTarget === column.sourceTarget && f.sourceColumn === column.sourceColumn);
      fields[original].destinationColumnName = available[index].destinationColumnName;
      fields[original].displayName = available[index].displayName;
      this.removeAvailableColumn(column.destinationColumnName);
    }
    this._selectedFieldList.next(fields);
  }

  private getAccountColumn(sourceTarget: DataTargetName): ConsolidationColumn {
    return <ConsolidationColumn> {
      id: null,
      destinationColumnName: sourceTarget === DataTargetName.consolidated ? 'accountId' : null,
      displayName: 'Account',
      fieldType: FieldType.EmptySpace,
      isCustom: false,
      selected: false,
      sourceColumn: 'accountId',
      sourceTarget: sourceTarget
    };
  }

  public autoMapCustomFields() {
    const fields = this._selectedFieldList.getValue().filter(c => c.destinationColumnName === null || c.destinationColumnName === '');
    fields.forEach(field => {
      const name = (field.sourceTarget === DataTargetName.client ? 'CF_' : 'AI_') + field.displayName;
      this.setColumnDestination(field, name);
    });
  }

  public autoMapFields() {
    const fields = this._selectedFieldList.getValue();
    // try mapping inventory fields first (they take precednce)
    fields
      .filter(c => (c.destinationColumnName == null || c.destinationColumnName === '') && c.sourceTarget === DataTargetName.inventory)
      .forEach(column => {this.autoMapColumn(column); } );

    // try mapping inventory fields first (they take precednce)
    fields
      .filter(c => (c.destinationColumnName == null || c.destinationColumnName === '') && c.sourceTarget === DataTargetName.client)
      .forEach(column => {this.autoMapColumn(column); } );

    this.autoMapCustomFields();
  }

  public validateDestinations(): string {
    const fields = this._selectedFieldList.getValue();
    // Check that all fields have been specified
    if (fields.some(x => x.destinationColumnName == null || x.destinationColumnName.length === 0)) {
      return 'Not all columns have a destination specified.';
    }
    // check for duplicates
    const uniq = fields.map((field) => ({count: 1, destination: field.destinationColumnName}))
      .reduce((a, b) => {
        a[b.destination] = (a[b.destination] || 0) + b.count;
        return a;
      }, {});
    const duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);
    if (duplicates.length > 0) {
      return 'There are duplicate destinations specified.  Please review the columns.';
    }
    // don't allow historical cost to be set.
    if (fields.some(x => x.destinationColumnName.toLowerCase() === 'historicalcost')) {
      return 'You cannot specify the destination of HistoricalCost.';
    }
    return '';
  }

  public getMapMatchCodeOptions(columnId: string): Array<SelectOption> {
    // get the column, so that we know the type.
    const column = this.getSelectedColumn(columnId);
    if (column == null) {
      return [];
    }

    const fields = this._clientFieldList.getValue()
      .concat(this._inventoryFieldList.getValue())
      .filter(x => x.fieldType === column.fieldType)
      .map(f => <SelectOption> {
        value: `${f.sourceTarget}_${f.sourceColumn}`,
        label: `${f.displayName} - ${f.sourceTarget === DataTargetName.client ? 'CF' : 'AI'}`,
        isCustom: f.isCustom
      });

      return fields;
  }

  public setColumnOverride(columnId: string, matchCodeId: string, target: DataTargetName, columnName: string): void {
    const column = this._selectedFieldList.getValue().find(s => s.id === columnId);
    if (column == null) {
      return;
    }

    let overrides = this._columnOverrides.getValue();
    const overrideIndex = overrides.findIndex(o => o.consolidationColumnId === columnId && o.matchCodeId === matchCodeId);
    if (overrideIndex === -1) {
      overrides.push(<ConsolidationColumnOverride> {
        consolidationColumnId: columnId,
        matchCodeId: matchCodeId,
        source: target,
        columnName: columnName
      });
    } else {
      if (overrides[overrideIndex].source === target && overrides[overrideIndex].columnName === columnName) {
        overrides = overrides.splice(overrideIndex, 1);
      } else {
        overrides[overrideIndex].source = target;
        overrides[overrideIndex].columnName = columnName;
      }
    }

    this._columnOverrides.next(overrides);
  }
}
