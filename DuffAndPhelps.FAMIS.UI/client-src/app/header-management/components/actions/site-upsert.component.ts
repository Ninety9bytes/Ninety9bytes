import { HeaderManagementService } from '../../services/header-management.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, OnDestroy, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { SiteDto } from '../../../_api/_runtime/dtos/site.dto';
import { MemberDto } from '../../../_api/_runtime/dtos/member.dto';
import { Subscription } from 'rxjs';
import { InsuranceApiService } from '../../../_api/_runtime/services/insurance-api.service';
import { WindowOption } from '../../../_models/window-option';

@Component({
  selector: 'site-upsert',
  templateUrl: './site-upsert.component.html'
})
export class SiteUpsertComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public request = <SiteDto>{};
  public action: string;
  public isLoading = false;
  public members: Array<MemberDto>;
  public isNameTaken = false;
  public isNumberTaken = false;

  private destory: Subscription;

  @ViewChild('content', { static: false }) private content: any; // Intentional -- following previous example

  @Output() onAddorUpdate = new EventEmitter<SiteDto>(); // Intentional -- following previous example
  @Output() onAction = new EventEmitter<string>();

  constructor(
    private insuranceApiService: InsuranceApiService,
    private headerManagementService: HeaderManagementService,
    public windowManager: WindowManager,
    private container: ViewContainerRef
  ) {}

  ngOnInit() {
    // Pull list of available members
    this.destory = this.insuranceApiService.getMembersByGroupId(this.headerManagementService.groupId).subscribe(response => {
      this.members = response;
    });
  }

  ngOnDestroy() {
    if (this.destory) {
      this.destory.unsubscribe();
    }
  }

  open(item?: SiteDto) {
    let modalTitle = '';
    this.isNameTaken = false;
    this.isNumberTaken = false;

    if (item) {
      this.action = 'Edit';
      Object.assign(this.request, item);
      modalTitle = 'Edit Site';
    } else {
      this.action = 'Add';
      this.request = <SiteDto>{};
      modalTitle = 'Add Site';
    }

    this.windowManager.open(this.content, modalTitle, <WindowOption>{
      isModal: true
    });
  }

  onSubmit(form) {
    this.isNameTaken = false;
    this.isNumberTaken = false;
    if (form.valid) {
      if (this.action === 'Add') {
        this.headerManagementService.upsertSite(this.request, true).subscribe(
          result => {
            this.onAction.emit(this.action);
            this.onAddorUpdate.emit(result);
            this.windowManager.close();
          },
          error => {
            if (error.error === 'Non-unique name') {
              this.isNameTaken = true;
            }
            if (error.error === 'Non-unique site number') {
              this.isNumberTaken = true;
            }
          }
        );
      }

      if (this.action === 'Edit') {
        this.headerManagementService.upsertSite(this.request, false).subscribe(
          result => {
            this.onAction.emit(this.action);
            this.onAddorUpdate.emit(result);
            this.windowManager.close();
          },
          error => {
            if (error.error === 'Non-unique name') {
              this.isNameTaken = true;
            }
            if (error.error === 'Non-unique site number') {
              this.isNumberTaken = true;
            }
          }
        );
      }
    }
  }
}
