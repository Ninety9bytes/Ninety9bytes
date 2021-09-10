import { AdministrationService } from '../../services/administration.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'administration-form',
  templateUrl: './administration-form.component.html'
})

export class AdministrationFormComponent implements OnInit {

  constructor(
    private administrationService: AdministrationService,
    private route: ActivatedRoute) {}

  ngOnInit() {
    this.administrationService.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    // console.log(this.administrationService.groupId);

    this.administrationService.updateGroupIdContext(this.administrationService.groupId);
  }

}
