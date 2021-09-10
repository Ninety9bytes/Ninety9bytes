
import { ConsolidationService } from '../../services/consolidation.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit, Input } from '@angular/core';
import { SelectOption } from '../../../_models/select-option.model';
import { ConsolidationColumn } from '../../../_models/reconciliation/consolidation-column.model';
import { DataTargetName } from '../../../_enums/data-target-name';

@Component({
  selector: 'dynamic-assignment-field',
  templateUrl: './dynamic-assignment-select.component.html'
})
export class DynamicAssignmentFieldComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input() columnId: string;
  @Input() matchCodeId: string;
  @Input() selectedValue: string;

  public formKey: string;
  public selectOptions: Array<SelectOption>;
  private column: ConsolidationColumn;

  constructor(private consolidationService: ConsolidationService) { }

  public ngOnInit(): void {
    this.formKey = `${this.columnId}_${this.matchCodeId}`;
    this.column = this.consolidationService.getSelectedColumn(this.columnId);
    this.selectOptions = this.consolidationService.getMapMatchCodeOptions(this.columnId);
  }

  public onChange(): void {
    const values = this.selectedValue.split('_');
    const target = <DataTargetName> parseInt(values[0], 10);
    this.consolidationService.setColumnOverride(this.columnId, this.matchCodeId, target, values.slice(1).join('_'));
    this.consolidationService.mapMatchCodesDirty = true;
  }
}
