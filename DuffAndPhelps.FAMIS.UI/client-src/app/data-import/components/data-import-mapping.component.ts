import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { ColumnMap } from '../../_models/column-map.model';
import { WizardService } from '../../_ui/services/wizard.service';
import { ImportTemplateColumn } from '../../_api/_configuration/dtos/import-template-column.dto';
import { DataTargetField } from '../../_models/data-target-field.model';
import { DataSourceOption } from '../../_models/data-import/data-source-option.model';
import { SpreadsheetColumnDto } from '../../_api/dtos/spreadsheet-column.dto';
import { DataImport } from '../../_models/data-import.model';
import { Subject } from 'rxjs';
import { OnInit, OnDestroy, Component } from '@angular/core';
import { ImportTemplatesApiService } from '../../_api/_configuration/services/import-templates-api.service';
import { DragulaService } from 'ng2-dragula';
// tslint:disable-next-line: max-line-length
import {  PrimaryInfoFieldLayout, BuildingLocationFieldLayout, BuildingValuationFieldLayout, BuildingSuperstructureFieldLayout, BuildingSubStructureFieldLayout, BuildingSystemFieldLayout, BuildingSiteAttributeFieldLayout, AdditionalDataFieldLayout, CoreLogicFieldLayout } from '../../quality-control/components/building/form/form-models/primary-info/primaryinfo-model';
// tslint:disable-next-line: max-line-length
import { CopedataWindFieldLayout, CopeDataEarthquakeFieldLayout } from '../../quality-control/components/building/form/form-models/copedata-model';
// tslint:disable-next-line: max-line-length
import { InitialFloodPlainFieldLayout, BuildingFloodPlainFieldLayout } from '../../quality-control/components/building/form/form-models/building-flood-plain-model';

export interface ColumnCategory {
  categoryName: string;
  columnMap: Array<ColumnMap>;
}

@Component({
  selector: 'app-data-import-mapping',
  templateUrl: './data-import-mapping.component.html'
})
export class DataImportMappingComponent implements OnInit, OnDestroy, TranslatedComponent {

  i18n = TranslationBaseKeys;
  private destroyed$ = new Subject<any>();

  showMappingAlert = false;
  showKeyFieldMappingAlert = false;
  dataImport: DataImport = new DataImport();
  hideAutoMapped = false;
  hideCategories = true;
  showHideAutoMappedText = 'Show Auto Mapped';
  showHideCategoriesText = 'Show Categories';
  sourceSpreadSheetColumns: Array<SpreadsheetColumnDto> = new Array<SpreadsheetColumnDto>();
  spreadsheetColumnsAvail: Array<DataSourceOption> = new Array<DataSourceOption>();
  dataTargetColumns: Array<DataTargetField> = new Array<DataTargetField>();
  mapping: Array<ColumnMap> = new Array<ColumnMap>();
  selectedDataTargetIds: Array<string> = new Array<string>();
  dataTargetName: string;
  sourceSpreadsheetName: string;
  columnNames: Array<string>;
  activeReplace: boolean;
  keyFields = new Array<ImportTemplateColumn>();
  keyFieldId = '';
  mappedSpreadsheetColumns = 0;
  unmappedSpreadsheetColumns = 0;
  dataTargetType: number;
  isBuilding: boolean;
  columnCategories: Array<ColumnCategory> = new Array<ColumnCategory>();
  buildingCategories = [
    'Primary Info',
    'Location',
    'Valuation',
    'Superstructure',
    'Substructure',
    'Occupancy',
    'Construction',
    'Systems',
    'Site Attributes',
    'Additional Data',
    'CoreLogic',
    'Secondary COPE Data (Wind)',
    'Secondary COPE Data (Earthquake)',
    'Flood Zone',
    'Others'
  ];
  inventoryCategories = [
    'Account Information',
    'Accounting Information',
    'Cost Information',
    'Descriptive Information',
    'Locational Information',
    'NA Removing',
    'Unique ID',
    'MISC Information',
    'Others'
  ];

  isLoading = false;
  hasDisplayIdColumn = false;

  constructor(
    private dragulaService: DragulaService,
    private wizardService: WizardService,
    private dataImportService: DataImportService,
    private importTemplatesApiService: ImportTemplatesApiService
  ) {
  }

  ngOnInit() {
    const dataImport = this.dataImportService.activeDataImport;
    this.columnNames = new Array<string>();
    const excelSummary = dataImport.excelSummary;

    this.activeReplace = this.dataImportService.activeReplace;

    if (excelSummary) {
      this.sourceSpreadsheetName = excelSummary.spreadsheetFileName;
      this.sourceSpreadSheetColumns = excelSummary.spreadsheetColumns;
      this.dataTargetColumns = excelSummary.dataTargetDescription.columns;
      this.dataTargetName = dataImport.spreadsheetUpload.dataTargetName;
      this.mapping = this.sortMapping(dataImport.mapping);
      this.populateColumnCategories(this.dataTargetName, dataImport.mapping);
    }
    this.dataTargetColumns.forEach(col => {
      this.columnNames.push(col.name);
    });

    this.sourceSpreadSheetColumns.forEach(col => {
      const isMapped = this.mapping.findIndex(c => c.spreadsheetColumn.name === col.name) >= 0;
      if (col.title.toLowerCase().replace(/\s/g, '') === 'displayid') {
        this.hasDisplayIdColumn = true;
      }
      this.spreadsheetColumnsAvail.push(<DataSourceOption>{ isMapped: isMapped, column: col });
    });
    this.sortSpreadsheetColumns();

    this.importTemplatesApiService
      .getImportTemplatesById(this.dataImportService.currentDataTargetId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(template => {
        this.dataTargetType = template.dataTarget;
        this.keyFields = template.importTemplateColumns.filter(column => {
          if (template.dataTarget === 3 && column.destinationEntity === 'Building') {
            if (column.name === 'DisplayId') {
              this.keyFieldId = column.id;
            }
            this.isBuilding = true;
            return column;
          } else if (template.dataTarget <= 2 && column.destinationEntity === 'AssetFileRecord') {
            return column;
          }
        });
      });
    this.updateMappedTotals();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    // console.log('import upload destoryed');
  }
  onKeyFieldSelect(): void {
    if (this.keyFieldId !== '') {
      this.showKeyFieldMappingAlert = false;
    }
  }

  getSpreadsheetColumn(columnName: string): any {
    return this.dataImportService.activeDataImport.excelSummary.spreadsheetColumns.find(c => c.name === columnName);
  }

  createMapping(value: any) {
    this.selectedDataTargetIds.push(value);
  }

  toggleAutoMapped() {
    this.hideAutoMapped = !this.hideAutoMapped;
    this.showHideAutoMappedText = this.hideAutoMapped ? 'Hide Auto-Mapped' : 'Show Auto-Mapped';
  }

  toggleCategories() {
    this.hideCategories = !this.hideCategories;
    this.showHideCategoriesText = !this.hideCategories ? 'Hide Categories' : 'Show Categories';
  }

  private hasClass(el: any, name: string) {
    return new RegExp('(?:^|\\s+)' + name + '(?:\\s+|$)').test(el.className);
  }

  private addClass(el: any, name: string) {
    if (!this.hasClass(el, name)) {
      el.className = el.className ? [el.className, name].join(' ') : name;
    }
  }

  handleCreatedCustomColumn(customColumn: ColumnMap) {
    this.columnNames.push(customColumn.dataTargetField);
    this.mapping.push(customColumn);
  }

  updateAvailableOptions(event: any) {
    this.spreadsheetColumnsAvail.forEach(val => {
      if (this.mapping.findIndex(c => c.spreadsheetColumn.name === val.column.name) !== -1) {
        val.isMapped = true;
      } else {
        val.isMapped = false;

        // This block will toggle autoMapped in the event the user manually un-maps an automaped field
        const mappingIndex = this.mapping
          .findIndex(c => c.dataTargetField.replace(/\s/g, '').toLowerCase() === val.column.title.replace(/\s/g, '').toLowerCase());
        if (mappingIndex !== -1) {
          this.mapping[mappingIndex].isAutoMapped = false;
        }
      }
    });
    this.sortSpreadsheetColumns();
  }

  back(event) {
    event.preventDefault();
    this.wizardService.setActiveTab('step-1');
  }

  isMapped(columnName: string) {
    const mappedValue = this.dataImport.mapping.find(c => c.spreadsheetColumn != null && c.spreadsheetColumn.name === columnName);

    return mappedValue == null;
  }

  onSubmit(form) {
    this.isLoading = true;

    if (!this.activeReplace && this.keyFieldId === '') {
      this.showKeyFieldMappingAlert = true;
      this.isLoading = false;
      return;
    }

    if (!this.hasDisplayIdColumn && this.isBuilding) {
      this.isLoading = false;
      return;
    }

    if (this.mapping.length > 0) {
      this.dataImportService.setMapping(this.mapping);
      this.dataImportService.currentKeyFieldId = this.keyFieldId;

      this.wizardService.setActiveTab('step-3');
    } else {
      this.showMappingAlert = true;
    }
    this.isLoading = false;
  }

  updateMappedTotals() {
    this.mappedSpreadsheetColumns = this.spreadsheetColumnsAvail.filter(c => c.isMapped).length;
    this.unmappedSpreadsheetColumns = this.spreadsheetColumnsAvail.filter(c => c.isMapped === false).length;
  }
  private sortSpreadsheetColumns() {
    const sortedArray = this.spreadsheetColumnsAvail.sort((a, b) => this.stringComparator(a.column.title, b.column.title));
    this.spreadsheetColumnsAvail = sortedArray;
  }

  private sortMapping(columns: ColumnMap[]): ColumnMap[] {
    const sortedArray = columns.sort((a, b) => this.stringComparator(a.dataTargetField, b.dataTargetField));
    return sortedArray;
  }

  private stringComparator(a, b): number {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  private populateColumnCategories(dataTargetName: string, columns: ColumnMap[]) {
    let columnMap: ColumnMap[];
    dataTargetName = dataTargetName.toLowerCase().replace(/\s/g, '');
    if ( dataTargetName.toLowerCase() === 'clientinventory'
      || dataTargetName === 'actualinventory'
      || dataTargetName === 'landimprovement'
      || dataTargetName === 'consolidatedinventory') {
      this.inventoryCategories.forEach((category) => {
        columnMap = new Array<ColumnMap>();
        columns.forEach(column => {
          const dataTargetField = column.dataTargetField.toLowerCase().replace(/\s/g, '');
          switch (category) {
            case 'Account Information':     if (dataTargetField === 'accountclass'
                                            ||  dataTargetField === 'accountdescription'
                                            ||  dataTargetField === 'accountnumber'
                                            ||  dataTargetField === 'glaccount'
                                            ||  dataTargetField === 'glaccumaccount'
                                            ||  dataTargetField === 'glassetaccount'
                                            ||  dataTargetField === 'insuranceaccount'
                                            ||  dataTargetField === 'assetclass'
                                            ||  dataTargetField === 'classcode') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Accounting Information':  if (dataTargetField === 'activitycode'
                                            ||  dataTargetField === 'acquisitiondate'
                                            ||  dataTargetField === 'depreciationmethod'
                                            ||  dataTargetField === 'disposalcode'
                                            ||  dataTargetField === 'functionactivity'
                                            ||  dataTargetField === 'fundcontribution'
                                            ||  dataTargetField === 'fundingsource'
                                            ||  dataTargetField === 'lifemonths'
                                            ||  dataTargetField === 'lifeyears'
                                            ||  dataTargetField === 'perioddepreciation'
                                            ||  dataTargetField === 'sourcecode'
                                            ||  dataTargetField === 'accumulateddepreciation'
                                            ||  dataTargetField === 'depreciationasofdate'
                                            ||  dataTargetField === 'disposaldate') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Cost Information':        if (dataTargetField === 'accumulateddepreciation'
                                            ||  dataTargetField === 'costofreproductionnew'
                                            ||  dataTargetField === 'historicalcost'
                                            ||  dataTargetField === 'netproceeds'
                                            ||  dataTargetField === 'salvagevalue') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Descriptive Information': if (dataTargetField === 'vendor'
                                            ||  dataTargetField === 'description'
                                            ||  dataTargetField === 'description2'
                                            ||  dataTargetField === 'description3'
                                            ||  dataTargetField === 'facedescription'
                                            ||  dataTargetField === 'manufacturer'
                                            ||  dataTargetField === 'modelnumber'
                                            ||  dataTargetField === 'quantity'
                                            ||  dataTargetField === 'serialnumber') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Locational Information':  if (dataTargetField === 'departmentname'
                                            ||  dataTargetField === 'departmentnumber'
                                            ||  dataTargetField === 'sitename'
                                            ||  dataTargetField === 'sitenumber'
                                            ||  dataTargetField === 'buildingname'
                                            ||  dataTargetField === 'buildingnumber'
                                            ||  dataTargetField === 'city'
                                            ||  dataTargetField === 'division'
                                            ||  dataTargetField === 'floor'
                                            ||  dataTargetField === 'locationinplant'
                                            ||  dataTargetField === 'plant'
                                            ||  dataTargetField === 'room'
                                            ||  dataTargetField === 'membername'
                                            ||  dataTargetField === 'membernumber') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'NA Removing':           if (dataTargetField === 'inventoryimageurl1'
                                            ||  dataTargetField === 'inventoryimageurl2'
                                            ||  dataTargetField === 'inventoryimageurl3'
                                            ||  dataTargetField === 'inventoryimageurl4'
                                            ||  dataTargetField === 'inventoryimageurl5'
                                            ||  dataTargetField === 'inventoryimageurl6'
                                            ||  dataTargetField === 'inventoryimageurl7') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Unique ID':               if (dataTargetField === 'assettagnumber'
                                            ||  dataTargetField === 'audittrail'
                                            ||  dataTargetField === 'oldtagnumber'
                                            ||  dataTargetField === 'displayid') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'MISC Information':        if (dataTargetField === 'businessunit'
                                            ||  dataTargetField === 'invoicenumber'
                                            ||  dataTargetField === 'purchaseorder'
                                            ||  dataTargetField === 'lastinventorydate'
                                            ||  dataTargetField === 'projectnumber'
                                            ||  dataTargetField === 'propertytype'
                                            ||  dataTargetField === 'shipmenttrackingnumber') {
                                              columnMap.push(column);
                                            }
                                            break;
            case 'Others':                  columnMap.push(column);
                                            break;
            default:                        break;
          }
        });
        if (columnMap.length > 0) {
          this.columnCategories.push({
            categoryName: category,
            columnMap: columnMap
          });
          columns = columns.filter(column => !columnMap.includes(column));
        }
      });
    }
    if (dataTargetName === 'building' || dataTargetName === 'minorbuilding') {
      this.buildingCategories.forEach((category) => {
        columnMap = new Array<ColumnMap>();
        columns.forEach(column => {
          const dataTargetField = column.dataTargetField.toLowerCase().replace(/\s/g, '');
          switch (category) {
            case 'Primary Info':      if (PrimaryInfoFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || PrimaryInfoFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Location':          if (BuildingLocationFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingLocationFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Valuation':         if (BuildingValuationFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingValuationFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Superstructure':    if (BuildingSuperstructureFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingSuperstructureFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Substructure':      if (BuildingSubStructureFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingSubStructureFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Occupancy':         if (dataTargetField.startsWith('occupancy')
                                      ||  dataTargetField.startsWith('storyheight')) {
                                        columnMap.push(column);
                                      }
                                      break;
            case 'Construction':      if (dataTargetField.startsWith('ceilingfinish')
                                      ||  dataTargetField.startsWith('coolingsystem')
                                      ||  dataTargetField.startsWith('electricalquality')
                                      ||  dataTargetField.startsWith('exteriorwallfinish')
                                      ||  dataTargetField.startsWith('floorfinish')
                                      ||  dataTargetField.startsWith('heatingsystem')
                                      ||  dataTargetField.startsWith('interiorwallfinish')
                                      ||  dataTargetField.startsWith('isoclass')
                                      ||  dataTargetField.startsWith('partitionwallstructure')
                                      ||  dataTargetField.startsWith('roofmaterial')
                                      ||  dataTargetField.startsWith('roofpitch')) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Systems':           if (BuildingSystemFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingSystemFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Site Attributes':   if (BuildingSiteAttributeFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingSiteAttributeFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Additional Data':   if (AdditionalDataFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || AdditionalDataFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            case 'CoreLogic':         if (CoreLogicFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || CoreLogicFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            // tslint:disable-next-line: max-line-length
            case 'Secondary COPE Data (Wind)':          if (CopedataWindFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                                        || CopedataWindFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                                          columnMap.push(column);
                                                        }
                                                        break;
            // tslint:disable-next-line: max-line-length
            case 'Secondary COPE Data (Earthquake)':    if (CopeDataEarthquakeFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                                        || CopeDataEarthquakeFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                                          columnMap.push(column);
                                                        }
                                                        break;
            // tslint:disable-next-line: max-line-length
            case 'Flood Zone':                          if (InitialFloodPlainFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                                        || InitialFloodPlainFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                                        // tslint:disable-next-line: max-line-length
                                                        || BuildingFloodPlainFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                                        || BuildingFloodPlainFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                                          columnMap.push(column);
                                                        }
                                                        break;
            // tslint:disable-next-line: max-line-length
            case 'Others':            if (BuildingSubStructureFieldLayout.left.findIndex(field => field.toLowerCase() === dataTargetField) !== -1
                                      || BuildingSubStructureFieldLayout.right.findIndex(field => field.toLowerCase() === dataTargetField) !== -1) {
                                        columnMap.push(column);
                                      }
                                      break;
            default:                  break;
          }
        });
        if (columnMap.length > 0) {
          this.columnCategories.push({
            categoryName: category,
            columnMap: columnMap
          });
          columns = columns.filter(column => !columnMap.includes(column));
        }
      });
    }
  }
}
