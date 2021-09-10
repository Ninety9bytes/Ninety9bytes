import { ConsolidationService } from '../../services/consolidation.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { ConsolidationColumn } from '../../../_models/reconciliation/consolidation-column.model';
import { GroupMatchCode } from '../../../_models/group-match-code.model';
import { ConsolidationColumnOverride } from '../../../_models/reconciliation/consolidation-column-override.model';
import { ConsolidationAssignment } from '../../../_models/reconciliation/consolidation-assignment.model';
import { ActivatedRoute } from '@angular/router';
import { MatchCodesService } from '../../../_api/services/reconciliation/match-codes.service';

@Component({
  selector: 'consolidation-match-code-assignment',
  templateUrl: './consolidation-match-code-assignment.component.html'
})
export class ConsolidationMatchCodeAssignmentComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public loadingBusyIndicator = true;
  public emptyMatchCodesIndicator = false;

  private selectedColumns: Array<ConsolidationColumn>;
  public selectedMatchCodes: Array<GroupMatchCode>;
  private matchCodeOverrides: Array<ConsolidationColumnOverride> = [];

  public models: Array<ConsolidationAssignment> = [];

  constructor(
    private route: ActivatedRoute,
    private consolidationService: ConsolidationService,
    private matchCodeService: MatchCodesService
  ) {}

  ngOnInit() {
    const groupId = this.route.parent.parent.snapshot.paramMap.get('groupId');
    this.loadAssignmentData(groupId);
  }

  private loadAssignmentData(groupId: string) {
    this.matchCodeService.getGroupMatchCodes(groupId).subscribe(matchCodes => {
      this.selectedMatchCodes = matchCodes.filter(matchCode => matchCode.matchCodeIsUsed === true);
      this.buildModel();
    });

    this.consolidationService.getSelectedColumns().subscribe(columns => {
          this.selectedColumns = columns;
          this.buildModel();
        });

    this.consolidationService.columnOverrides.subscribe(overrides => {
      this.matchCodeOverrides = overrides;
      this.buildModel();
    });

  }

  private buildModel() {
    this.models = [];
    if (this.selectedColumns == null || this.selectedMatchCodes == null) {
      return;
    }
    if (this.selectedColumns.length === 0 || this.selectedMatchCodes.length === 0) {
      this.loadingBusyIndicator = false;
      this.emptyMatchCodesIndicator = this.selectedMatchCodes.length === 0;
      return;
    }

    this.selectedColumns.forEach(column => {
      const entity = <ConsolidationAssignment> {
        id: column.id,
        columnName: column.sourceColumn,
        displayName: column.sourceColumn === column.destinationColumnName ? column.displayName : column.destinationColumnName,
        source: column.sourceTarget,
        isCustom: column.isCustom
      };
      this.selectedMatchCodes.forEach(code => {
        const override = this.matchCodeOverrides.find(o => o.consolidationColumnId === column.id && o.matchCodeId === code.matchCodeId);
        entity[code.matchCodeId] = override == null ? `${column.sourceTarget}_${column.sourceColumn}`
                                                    : `${override.source}_${override.columnName}`;
      });
      this.models.push(entity);
    });

    this.loadingBusyIndicator = false;
  }

}
