import { Component, OnInit } from '@angular/core';
import { Team } from '../../../_models/team.model';

@Component({
  selector: 'team-edit',
  templateUrl: './team-edit.component.html'
})
export class TeamEditComponent implements OnInit {

  team: Team;
  constructor() { }

  ngOnInit() {
    this.team = new Team();
    this.team.Name = 'FAMIS';
    this.team.Active = true;
  }
}
