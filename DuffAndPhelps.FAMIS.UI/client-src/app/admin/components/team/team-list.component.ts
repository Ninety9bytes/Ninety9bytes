import { SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { testTeams } from './teams';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { Team } from '../../../_models/team.model';

@Component({
  selector: 'team-list',
  templateUrl: './team-list.component.html'
})
export class TeamListComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  teams: Team[] = testTeams;
  selectedRow: number;
  selectedTeam: Team = this.teams[0];

  constructor() {}

  ngOnInit() {
    this.selectedRow = 0;
  }

  selectRow(event: SelectionEvent) {
    this.selectedRow = 0;
    this.selectedTeam = event.selectedRows[0].dataItem;
  }

  public isRowSelected = (e: RowArgs) => e.index === this.selectedRow;
}
