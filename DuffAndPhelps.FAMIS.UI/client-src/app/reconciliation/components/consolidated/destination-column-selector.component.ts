import { ConsolidationService } from '../../services/consolidation.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ConsolidationColumn } from '../../../_models/reconciliation/consolidation-column.model';
import { SelectOption } from '../../../_models/select-option.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'destination-column-selector',
  templateUrl: './destination-column-selector.component.html',
})
export class DestinationColumnSelectorComponent implements OnInit, OnDestroy, OnChanges, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input('column') column: ConsolidationColumn;
  @Input('value') destinationColumnValue: string;

  validationMessage = '';
  selectedValue: string;
  customValue: string;

  public availableColumns: Array<SelectOption> = [];
  public standardColumns: Array<ConsolidationColumn> = [];

  public selectOptionSubscription: Subscription;

  constructor(private consolidationService: ConsolidationService) { }

  public ngOnInit(): void {
    this.initSelectOptions();
  }

  public ngOnDestroy(): void {
    if (this.selectOptionSubscription) {
      this.selectOptionSubscription.unsubscribe();
      this.selectOptionSubscription = null;
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if ((this.selectedValue == null || this.selectedValue.length === 0)
     && (this.destinationColumnValue != null && this.destinationColumnValue.length > 0) ) {
      this.selectedValue = this.resolveDestinationColumnValue(this.destinationColumnValue);
    }
    this.addSelectedValueToOptions();
  }

  private resolveDestinationColumnValue(destinationColumnValue: string): string {
    const column = this.consolidationService.getDefaultColumns().find(x => x.sourceColumn === destinationColumnValue);
    return (column == null) ? '-1' : column.sourceColumn;
  }

  private initSelectOptions() {
    this.selectOptionSubscription = this.consolidationService.availableDestinationList.subscribe(
      options => {
        this.availableColumns = [];
        options
          .filter(x => x.fieldType === this.column.fieldType)
          .forEach(option => {
            this.availableColumns.push(<SelectOption> {
              label: option.displayName,
              value: option.destinationColumnName,
            });
        });

        this.availableColumns = this.availableColumns.sort((a, b) => this.stringComparator(a, b));

        if (this.selectedValue != null && this.availableColumns.findIndex(x => x.value === this.selectedValue) === -1) {
          this.addSelectedValueToOptions();
        }
      });
  }

  private stringComparator(a, b): number {
    if (a < b) { return -1; }
    if (a > b) { return 1; }
    return 0;
  }

  private addSelectedValueToOptions() {
    if (this.selectedValue == null || this.selectedValue.length === 0) {
      return;
    }

    const defaultColumn = this.consolidationService.getDefaultColumns()
      .find(x => x.sourceColumn.toLowerCase() === this.selectedValue.toLowerCase());
    // This is a standard column that doesn't exist in the list
    if (defaultColumn != null) {
      if (this.availableColumns.findIndex(x => x.label === defaultColumn.displayName) === -1) {
        this.availableColumns.push(<SelectOption> {
          label: defaultColumn.displayName,
          value: defaultColumn.destinationColumnName,
        });
      }
    } else {
      this.customValue = this.column.destinationColumnName;
    }
  }

  public onSelectionChanged() {

    this.consolidationService.defineLayoutDirty = true;

    if (this.selectedValue == null || this.selectedValue === '' || this.selectedValue === '-1') {
      this.setTargetColumnValue('');
      return;
    }
    this.customValue = '';
    this.setTargetColumnValue(this.selectedValue);
  }

  public onTextChanged() {
    if (this.selectedValue !== '-1') {
      return;
    }
    this.setTargetColumnValue(this.customValue);
  }

  private setTargetColumnValue(columnName: string) {
    const result = this.consolidationService.setColumnDestination(this.column, columnName);
    if (!result.success) {
      this.validationMessage = result.message;
      this.selectedValue = this.selectedValue === '-1' ? this.selectedValue : '';
      this.customValue = '';
      return;
    }
    this.column.destinationColumnName = columnName;
    this.validationMessage = '';
  }
}
