import { CreateMatchCodeComponent } from './create-match-code.component';
import { ReconciliationConstants } from '../reconciliation.constants';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { RowClassArgs, SelectionEvent, GridDataResult, PageChangeEvent, DataStateChangeEvent,
  SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService } from '../../_core/services/alert.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MatchCode } from '../../_models/match-code.model';
import { Observable } from 'rxjs';
import { MatchCodesService } from '../../_api/services/reconciliation/match-codes.service';

@Component({
  selector: 'match-codes',
  templateUrl: './match-codes.component.html'
})
export class MatchCodesComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  matchcodeGridBusy = true;
  pageSize = 100;
  skip = 0;

  @ViewChild(CreateMatchCodeComponent, {static: false})
  createMatchCodeComponent: CreateMatchCodeComponent;
  @Input() selectedMatchCodeIds: Array<any>;
  @Input() includeContractSearch: Array<any>;
  @Output() onMatchCodeSelection = new EventEmitter<any>();
  @Output() onMatchCodesLoaded = new EventEmitter<any>();

  matchCodes$: Observable<MatchCode[]>;
  matchCodes: MatchCode[] = new Array<MatchCode>();

  public selectableSettings = <SelectableSettings> {
    checkboxOnly: true,
    mode: 'multiple'
  };

  state: State = {
    skip: 0,
    take: 100,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
    },

    sort: <SortDescriptor[]>[{
      dir: 'asc',
      field: 'name'
    }]

  };

  public sortSelectedAsc = false;
  public sortSelectedDesc = false;

  gridData: GridDataResult = process(this.matchCodes, this.state);

  constructor(private matchCodesService: MatchCodesService, private alertService: AlertService) { }

  pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadMatchCodes();
  }

  private loadMatchCodes(): void {
    this.gridData = {
      data: this.matchCodes.slice(this.skip, this.skip + this.pageSize),
      total: this.matchCodes.length
    };
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.matchCodes, this.state);
  }

  ngOnInit() {
    this.matchCodes$ = this.matchCodesService.getMatchCodes();
    this.matchCodes$.subscribe(
      codes => {
        this.matchCodes = codes.filter(code => code.categoryId !== ReconciliationConstants.SystemMatchCategoryId);
        this.gridData = process(this.matchCodes, this.state);

        this.matchCodesService.cachedMatchCodes = codes;
        this.onMatchCodesLoaded.emit(codes);
      },
      error => {},
      () => this.matchcodeGridBusy = false);

    if (!this.selectedMatchCodeIds) {
      this.selectedMatchCodeIds = new Array<any>();
    }
  }

  onSelectionChanged(args?: SelectionEvent) {
    setTimeout(() => {
      this.onDeselectedRows(args.deselectedRows);
      this.validateSelectedRows(args.selectedRows);
      this.emitSelectedRows();
    });
  }

  private onDeselectedRows(deselectedRows: Array<any>){
    if (deselectedRows == null || deselectedRows.length === 0) {
      return;
    }

    deselectedRows.forEach(value => {
      const matchCode = this.matchCodes.find(c => c.id === value.dataItem.id);
      matchCode.isSelected = false;
    });
  }

  private validateSelectedRows(selectedRows: Array<any>) {
    selectedRows.forEach(value => {
      const matchCode = this.matchCodes.find(c => c.id === value.dataItem.id);
      if (!matchCode.isEnabled) {
        this.alertService.error('This match code is disabled and cannot be added to the group.');
        this.selectedMatchCodeIds.splice(this.selectedMatchCodeIds.findIndex(c => c === value), 1);
      }
    });
  }

  private emitSelectedRows() {
    const selectedMatchCodes = new Array<MatchCode>();
    this.selectedMatchCodeIds.forEach(id => {
      const matchCode = this.matchCodes.find(c => c.id === id);
      matchCode.isSelected = true;
      selectedMatchCodes.push(matchCode);
    });

    this.onMatchCodeSelection.emit(selectedMatchCodes);
}

  editMatchCode(id: string, event: any) {
    event.preventDefault();
    this.createMatchCodeComponent.open(event, id);
  }

  handleCreatedorModifiedMatchCode(matchCode: MatchCode) {
    const existingMatchCode = this.matchCodes.find(c => c.id === matchCode.id);

    if (!existingMatchCode) {
      this.matchCodes.push(matchCode);
    } else {
      const index = this.matchCodes.indexOf(existingMatchCode);
      this.matchCodes[index] = matchCode;
    }
    this.gridData = process(this.matchCodes, this.state);
  }

  public sortSelected() {
    if (this.sortSelectedDesc) {
      this.sortSelectedAsc = true;
      this.sortSelectedDesc = false;
      this.setSortDescriptor('asc', 'isSelected');
    } else {
      this.sortSelectedAsc = false;
      this.sortSelectedDesc = true;
      this.setSortDescriptor('desc', 'isSelected');
    }

    this.gridData = process(this.matchCodes, this.state);
  }

  private setSortDescriptor(direction: string, field: string) {
    this.state.sort = <SortDescriptor[]>[{
      dir: direction,
      field: field
    }];
  }

  public isDisabled(context: RowClassArgs) {
    return context.dataItem.isEnabled ? 'enabled-row' : 'disabled-row';
  }
}
