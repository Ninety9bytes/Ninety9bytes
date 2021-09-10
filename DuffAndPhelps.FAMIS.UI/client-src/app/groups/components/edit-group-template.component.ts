import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'edit-group-template',
  templateUrl: './edit-group-template.component.html'
})
export class EditGroupTemplateComponent implements OnInit {

  templateId:string;
  groupId:string;

  constructor(private groupsService: GroupsService) {}

  ngOnInit() {

    this.groupId = this.groupsService.groupId;

    this.groupsService.getTemplateForGroup(this.groupsService.groupId).subscribe(dto => {

      if (dto) {
        this.templateId = dto.id;
      }

    });

  }
}
