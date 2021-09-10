import { HeaderManagementService } from '../../services/header-management.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { MemberDto } from '../../../_api/_runtime/dtos/member.dto';
import { WindowOption } from '../../../_models/window-option';

@Component({
  selector: 'member-upsert',
  templateUrl: './member-upsert.component.html'
})
export class MemberUpsertComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public request = <MemberDto>{};
  public action: string;
  public isLoading = false;
  public isNameTaken = false;

  @ViewChild('content', { static: false })
  private content: any; // Intentional -- following previous example

  @Output()
  onAddorUpdate = new EventEmitter<MemberDto>();
  @Output()
  onAction = new EventEmitter<string>();

  constructor(
      private headerManagementService: HeaderManagementService,
      public windowManager: WindowManager,
      private container: ViewContainerRef
    ) {}

  ngOnInit() {}

  open(item?: MemberDto) {
    let modalTitle = '';
    this.isNameTaken = false;

    if (item) {
      this.action = 'Edit';
      Object.assign(this.request, item);
      modalTitle = 'Edit Member';
    } else {
      this.action = 'Add';
      this.request = <MemberDto>{};
      modalTitle = 'Add Member';
    }

    this.windowManager.open(this.content, modalTitle, <WindowOption>{
      isModal: true

    });
  }

  onSubmit(form) {
    this.isNameTaken = false;
    if (form.valid) {
      if (this.action === 'Add') {
        this.headerManagementService.upsertMember(this.request, true).subscribe(
          result => {
            this.onAction.emit(this.action);
            this.onAddorUpdate.emit(result);
            this.windowManager.close();
          },
          error => {
            if (error.status === 409) {
              this.handleError();
            }
          }
        );
      }

      if (this.action === 'Edit') {
        this.headerManagementService.upsertMember(this.request, false).subscribe(
          result => {
            this.onAction.emit(this.action);
            this.onAddorUpdate.emit(result);
            this.windowManager.close();
          },
          error => {
            if (error.status === 409) {
              this.handleError();
            }
          }
        );
      }
    }
  }

  handleError() {
    this.isNameTaken = true;
  }
}
