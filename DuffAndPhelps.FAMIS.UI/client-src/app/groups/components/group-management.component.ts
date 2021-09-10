import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { GroupManagementModalComponent } from './group-management-modal.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { AlertService } from '../../_core/services/alert.service';
import { GroupsService } from '../services/groups.service';
import { forkJoin, Subject } from 'rxjs';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { UserGridService } from '../../_core/services/user-grid.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FamisGrid } from '../../_models/shared/famis-grid-state.model';
import { SortDescriptor, State, CompositeFilterDescriptor, process } from '@progress/kendo-data-query';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { GroupTemplateDto } from '../../_api/_runtime/dtos/group-template.dto';
import { ModalProperties } from '../../_models/modal-properties.model';

@Component({
  selector: 'group-management',
  templateUrl: './group-management.component.html'
})
export class GroupManagementComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild(GroupManagementModalComponent, { static: false })
  groupManagementModalComponent: GroupManagementModalComponent;
  private modalRef: NgbModalRef;
  private windowSize = 500;
  public groupGrid: FamisGrid;
  public groupId: string;
  public contractId: string;
  public action: string;
  public groupNames: Array<string>;
  public sort: SortDescriptor[];
  public state: State = {
    skip: 0,
    take: 25
  };

  public userGridSettingName = this.userGridService.createUserGridId(
    null,
    this.router.url.toString().split('?')[0],
    'Group Management Grid'
  );

  public filterRoot = { logic: 'and', filters: [] } as CompositeFilterDescriptor;

  private destroyed$ = new Subject<any>();
  private localGroupManagementData = new Array<any>();

  gridData: GridDataResult = process(this.localGroupManagementData, this.state);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private famisGridService: FamisGridService,
    private groupsService: GroupsService,
    private alertService: AlertService,
    private groupApiService: GroupApiService,
    private userGridService: UserGridService
  ) {}

  ngOnInit() {
    this.famisGridService.setUserId();

    this.groupId = this.groupsService.groupId;
    this.groupApiService.getContractGroup(this.groupId, false).subscribe(result => {
      this.contractId = result.contractId;
    });

    this.loadGridData();
  }

  private loadGridData(): void {
    const getGroupRecords = this.groupsService.updateGroupTemplateResults(this.groupId);

    const loading = forkJoin(getGroupRecords).subscribe(([groupResults]) => {
      this.userGridService.getSettings(this.famisGridService.userId, this.userGridSettingName, null)
          .subscribe(gridSettings => {
              if (gridSettings.filters && gridSettings.filters.filters && gridSettings.filters.filters.length > 0) {
                this.filterRoot = gridSettings.filters;
                this.state.filter = this.filterRoot;
                this.refreshGridData();
              } else {
                this.refreshGridData();
              }
            });
      groupResults.contractGroupTemplateInfo = groupResults.contractGroupTemplateInfo.filter(x => x.isPortal === false);
      this.groupNames = groupResults.contractGroupTemplateInfo.map(y => y.groupName);
      this.groupsService.setGroupTemplateDataSource(groupResults.contractGroupTemplateInfo);

      this.localGroupManagementData = groupResults.contractGroupTemplateInfo;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
  }

  handleAction(response: string) {
    this.action = response;
  }

  handleCreateorModifiedGroup(response: GroupTemplateDto) {
    this.alertService.success('Group {{groupName}} has been ' + (this.action === 'Edit' ? 'updated.' : 'created.'), null, {
      groupName: response.groupName
    });
    this.localGroupManagementData.push(response);
    this.refreshGridData();
    this.loadGridData();
  }

  delete(item: GroupTemplateDto) {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties>{
      heading: {
        key: 'Delete Group'
      },
      body: {
        key: '{{groupName}} cannot be deleted. Records are currently associated with this group.',
        params: {groupName: item.groupName}
      },
      dismissText: {
        key: 'Close'
      },
      translateBaseKey: this.i18n.dashboard
    };

    const sameGroup = item.groupId === this.groupId;

    if (sameGroup) {
      modalOptions.body = {
        key: 'Cannot delete group you are currently active in, please select a different group.'
      };
    }

    if (item.canDelete && !sameGroup) {
      modalOptions.successText = {
        key: 'Delete'
      };
      modalOptions.body = {
        key: 'Are you sure you wish to delete {{groupname}}',
        params: {groupname: item.groupName}
      };
    }

    modal.componentInstance.options = modalOptions;

    modal.result.then(
      confirm => {
        this.groupApiService.deleteGroup(item.groupId).subscribe(result => {
          this.localGroupManagementData = this.localGroupManagementData.filter(g => g.groupId !== item.groupId);
          this.refreshGridData();
          this.alertService.success(item.groupName + ' has been deleted.');
        });
      },
      cancel => {}
    );
  }

  handleActionEvent(dataItem: GroupTemplateDto, actionEvent: string) {
    if (actionEvent === 'Delete') {
      this.delete(dataItem);
    }

    if (actionEvent === 'Edit') {
      this.groupManagementModalComponent.groupNames = this.groupNames;
      this.groupManagementModalComponent.open(dataItem);
    }
  }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.localGroupManagementData, this.state);
  }

  private refreshGridData() {
    this.gridData = process(this.localGroupManagementData, this.state);
  }

  back() {
    window.location.href = `/project-profile/${this.groupsService.groupId}/MainProfile`;
  }

  public handleFilterChange(filter: any): void {
    // save the filter
    this.filterRoot = filter;
    this.userGridService.saveSettings(this.userGridSettingName, null,
    null, this.famisGridService.userId, null, this.filterRoot).subscribe();
  }
}
