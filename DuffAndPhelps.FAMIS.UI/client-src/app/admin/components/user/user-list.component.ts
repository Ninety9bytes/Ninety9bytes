import { SelectionEvent, RowArgs } from '@progress/kendo-angular-grid';
import { testUsers } from './users';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { User } from '../../../_models/user.model';

@Component({
  selector: 'user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  users: User[] = testUsers;
  selectedRow:  number;
  selectedUser: User;


  constructor() {
    this.selectedUser = testUsers[0];
   }

  ngOnInit() {
   this.selectedRow = 0;

  }

  selectRow(event: SelectionEvent) {
    this.selectedRow = 0;
    this.selectedUser = event.selectedRows[0].dataItem;
  }

  public isRowSelected = (e: RowArgs) =>  e.index === this.selectedRow;

  delete() {
    this.users = [];
  }
}
