import { PortalManagementService } from '../services/portal-management.service';
import { AddPortalAccessComponent } from './Actions/add-portal-access-modal.component';
import {AlertService} from '../../_core/services/alert.service';
import { WindowManager } from '../../_core/services/window-manager.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { ContractSummaryDto } from '../../_api/dtos/contract-summary.dto';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import { WindowOption } from '../../_models/window-option';
import { ModalFormEvent } from '../../_enums/modal-form-event';

@Component({
  selector: 'portal-management',
  templateUrl: './portal-management.component.html'
})
export class PortalManagementComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public portalContracts: Array<ContractSummaryDto>;
  public selectedContractId: string;
  public selectedGroup: GroupDto;
  constructor(
    private portalService: PortalManagementService,
    private windowManager: WindowManager,
    public container: ViewContainerRef,    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  ngOnDestroy() {

  }

  launchAddPortalModal() {
    const windowRef = this.windowManager.open(AddPortalAccessComponent, 'Add Portal Access', <WindowOption>{
      isModal: true
    });

    windowRef.result.subscribe(() => {
      if (windowRef.content.instance.submitResponse === ModalFormEvent.Success) {
        this.refreshData();
        this.alertService.success('Portal Account Created');
      }
    });
  }

  private refreshData() {
    this.portalService.getPortalContracts().subscribe(res => {
      this.portalContracts = res;
    });
  }

  setSelectedGroup() {
    if (this.selectedContractId) {
      const c = this.portalContracts.find(f => f.id === this.selectedContractId);
      const groupId = c.groupIds[0];

      this.portalService.getGroup(groupId).subscribe(res => {
        this.selectedGroup = res;
      });
    }
  }
}
