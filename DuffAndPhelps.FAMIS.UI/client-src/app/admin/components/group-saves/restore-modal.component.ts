import {NgbModal, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../_core/services/alert.service';
import { GroupSaveService } from '../../services/group-save-service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { GroupSave } from '../../../_models/group-save.model';

@Component({
  selector: 'restore-milestone',
  templateUrl: './restore-modal.component.html'
})

export class RestoreModalComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private modalRef: NgbModalRef;
  private restoreGroupSave: GroupSave;
  public restoreComplete = false;
  public restoreInitiated = false;

  @ViewChild('content', { static: false }) private content: any; // intentional, following previous examples
  @Output() onAction = new EventEmitter<GroupSave>();
  @Output() onAddOrUpdate = new EventEmitter<GroupSave>();
  constructor(private modalService: NgbModal,
              private groupSaveService: GroupSaveService,
              private alertService: AlertService,     private windowManager: WindowManager,
              public container: ViewContainerRef) {}
  ngOnInit() {}

  ngOnDestroy() {}

  restore() {
    const requestDto = this.mapRequestDto(this.restoreGroupSave);
    // tslint:disable-next-line:max-line-length
    this.alertService.info('Your restore request has been successfully initiated. Please refrain access to this group until the restoration is complete!');
    // internally includes inserting a new entry into the rollback milestones table
    this.restoreInitiated = true;
    this.groupSaveService.restoreToSavePoint(requestDto).subscribe(response => {
        // console.log(response);
        if (response) {
          this.restoreComplete = true;
          this.restoreInitiated = false;
          this.modalRef.dismiss();
          this.onAction.emit(this.restoreGroupSave);
        }
    });

    this.restoreComplete = false;
  }

  cancel() {
    this.modalRef.dismiss();
  }

  open(item?: GroupSave) {
    this.restoreGroupSave = item;
    this.modalRef = this.modalService.open(this.content, {
                                           backdrop: 'static', size: 'lg',
                                           keyboard: false,
                                           windowClass: 'mediumModal' });
  }

  mapRequestDto(item: GroupSave): GroupSave {
    const request = <GroupSave>{
        description: item.description,
        createdTime: item.createdTime,
        groupId: item.groupId,
        updatedUserId: item.updatedUserId,
        id: item.id
    };
    return request;
  }

}
