import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { HeaderManagementService } from '../services/header-management.service';
import { AlertService } from '../../_core/services/alert.service';
import { HelperService } from '../../_core/services/helper.service';
import { MemberUpsertComponent } from './actions/member-upsert.component';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { MemberDto } from '../../_api/_runtime/dtos/member.dto';
import { ModalProperties } from '../../_models/modal-properties.model';
import { FamisGridCacheResult } from '../../_models/shared/famis-grid-cache-result.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'header-management-member',
  templateUrl: './header-management-member.component.html'
})
export class HeaderManagementMemberComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public dataGrid: FamisGrid;
  public isLoading = false;
  public action: string;

  private windowSize = 500;
  private handleLocalError = true;

  @ViewChild(MemberUpsertComponent, { static: false })
  memberUpsertComponent: MemberUpsertComponent;

  constructor(
    private famisGridService: FamisGridService,
    private headerManagementService: HeaderManagementService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private helperService: HelperService,
    private router: Router
  ) {}

  ngOnInit() {

    this.dataGrid = <FamisGrid>{
      height: 330,
      gridId: this.famisGridService.createGrid(),
      name: 'member-tab',
      windowSize: this.windowSize,
      totalRecordCount: 0,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter],
      actions: ['Edit', 'Delete'],
      translationBaseKey: this.i18n.asset,
      hideTitle: true
    };

    this.dataGrid.loading = this.headerManagementService.getMemberMetadata().subscribe(metaData => {

      this.dataGrid.columnHeaders = this.helperService.mapHeaders(metaData.fields, []);
      this.dataGrid.selectedHeaders = ['memberName', 'memberNumber'];
    });

    this.famisGridService.setUserId();

    // filter grid settings loader
  
  }

  ngOnDestroy() {}

  handleActionEvent(actionEvent: FamisGridActionEvent) {
    if (actionEvent.action === 'Delete') {
      this.delete(actionEvent.item);
    }

    if (actionEvent.action === 'Edit') {
      this.memberUpsertComponent.open(actionEvent.item);
    }
  }

  handleAction(response: string) {
    this.action = response;
  }

  handleCreateorModified(response: MemberDto) {
    this.alertService.success('Member {{memberName}} has been '
     + (this.action === 'Edit' ? 'updated.' : 'created.'), null, {memberName: response.memberName});

    // Call to update grid
    this.updateCache();
  }

  delete(item: MemberDto) {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties>{
        heading: {
          key: 'Delete Member'
        },
        body: {
          key: `Are you sure you wish to delete '{{itemMemberName}}'`,
          params: {itemMemberName: item.memberName}
        },
        dismissText: {
          key: 'Close',
        },
        successText: {
          key: 'Delete'
        },
        translateBaseKey: this.i18n.common
    };

    modal.componentInstance.options = modalOptions;

    modal.result.then(confirm => {
        this.headerManagementService.deleteMember(item.id, this.handleLocalError).subscribe(result => {
          if (result) {
            this.updateCache();
            this.alertService.success('{{description}} has been deleted.', null, { description: item.memberName });
            this.dataGrid.loading = this.processCacheUpdate();
          }
        }, error => {
          switch (error.status) {
            case 409:
              this.alertService.warn('{{description}} cannot be deleted without first removing related sites.',
                null, { description: item.memberName });
              break;
            default:
              this.alertService.error('An unexpected error has occurred.');
          }
        });
    }, cancel => {
    });
  }

  updateCache(request?: FamisGridCacheResult) {
    const s = this;

    const successCacheLoading = new Subscription();
    const errorCacheLoading = new Subscription();

    this.dataGrid.cacheLoading = s.processCacheUpdate(request);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.headerManagementService
      .updateMemberData(
        s.headerManagementService.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
        cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
        cacheUpdateRequest ? cacheUpdateRequest.filters : null
      )
      .subscribe(dto => {
        this.dataGrid.totalRecordCount = dto.totalInRecordSet;

        s.famisGridService.setCacheRecords(
          dto.members,
          s.dataGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.numberInThisPayload,
          this.dataGrid.windowSize
        );
      });
  }
}
