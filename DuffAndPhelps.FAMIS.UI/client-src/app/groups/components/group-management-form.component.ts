import { GroupsService } from '../services/groups.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'group-management-form',
  templateUrl: './group-management-form.component.html'
})
export class GroupManagementFormComponent implements OnInit {
  constructor(private route: ActivatedRoute, private groupsService: GroupsService) {}

  ngOnInit() {
    this.groupsService.groupId = this.route.parent.snapshot.paramMap.get('groupId');
  }
}
