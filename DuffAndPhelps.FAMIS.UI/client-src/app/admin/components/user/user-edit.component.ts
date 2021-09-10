import { Component, Input, OnInit } from '@angular/core';
import { IntlService } from '@progress/kendo-angular-intl';
import { User } from '../../../_models/user.model';

@Component({
  selector: 'user-edit',
  templateUrl: './user-edit.component.html'
})
export class UserEditComponent implements OnInit {
  @Input() user: User;

  constructor(public intl: IntlService) {}

  ngOnInit() {
    this.user = new User();
  }
}
