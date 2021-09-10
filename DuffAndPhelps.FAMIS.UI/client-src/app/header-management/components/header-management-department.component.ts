import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { HeaderManagementService } from '../services/header-management.service';
import { AlertService } from '../../_core/services/alert.service';
import { HelperService } from '../../_core/services/helper.service';
import { DepartmentUpsertComponent } from './actions/department-upsert.component';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { DepartmentDto } from '../../_api/_runtime/dtos/department.dto';
import { ModalProperties } from '../../_models/modal-properties.model';
import { FamisGridCacheResult } from '../../_models/shared/famis-grid-cache-result.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'header-management-department',
  templateUrl: './header-management-department.component.html'
})
export class HeaderManagementDepartmentComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public dataGrid: FamisGrid;
  public isLoading = false;
  public action: string;

  private windowSize = 500;
  private handleLocalError = true;

  @ViewChild(DepartmentUpsertComponent, { static: false })
  departmentUpsertComponent: DepartmentUpsertComponent;

  constructor(
    private famisGridService: FamisGridService,
    private headerManagementService: HeaderManagementService,
    private modalService: NgbModal,
    private helperService: HelperService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {

    this.dataGrid = <FamisGrid>{
      height: 330,
      gridId: this.famisGridService.createGrid(),
      name: 'department-tab',
      windowSize: this.windowSize,
      totalRecordCount: 0,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.Filter],
      actions: ['Edit', 'Delete'],
      translationBaseKey: this.i18n.dataImport,
      hideTitle: true
    };

    this.dataGrid.loading = this.headerManagementService.getDepartmentMetadata().subscribe(metaData => {
      console.dir(metaData);

    this.dataGrid.columnHeaders = this.helperService.mapHeaders(metaData.fields, []);
    this.dataGrid.selectedHeaders = ['description', 'departmentNumber'];
    
  });
}

  ngOnDestroy() {}

  handleActionEvent(actionEvent: FamisGridActionEvent) {
    if (actionEvent.action === 'Delete') {
      this.delete(actionEvent.item);
    }
    if (actionEvent.action === 'Edit') {
      this.departmentUpsertComponent.open(actionEvent.item);
    }
  }

  handleAction(response: string) {
    this.action = response;
  }

  handleCreateorModified(response: DepartmentDto) {
    this.alertService.success('Department {{description}} has been ' + (this.action === 'Edit' ? 'updated.' : 'created.'), null, {
      description: response.description
    });


    // Call to update grid
    this.updateCache();
  }

  delete(item: DepartmentDto) {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties> {
      heading: {
        key: 'Delete Department'
      },
      body: {
        key: 'Are you sure you wish to delete {{itemDescription}}?',
        params: {itemDescription: item.description}
      },
      dismissText: {
        key: 'Close'
      },
      successText: {
        key: 'Delete'
      },
      translateBaseKey: this.i18n.common
    };

    modal.componentInstance.options = modalOptions;

    modal.result.then(
      confirm => {
        this.headerManagementService.deleteDepartment(item.id, this.handleLocalError).subscribe(result => {
          if (result) {
            this.alertService.success('{{description}} has been deleted.', null, { description: item.description });

            this.dataGrid.loading = this.processCacheUpdate();
          } else {
            this.alertService.warn('{{description}} cannot be deleted.', null, { description: item.description });
          }
        });
      },
      cancel => {}
    );
  }

  updateCache(request?: FamisGridCacheResult) {
    const s = this;

    const successCacheLoading = new Subscription();
    const errorCacheLoading = new Subscription();

    this.dataGrid.cacheLoading = s.processCacheUpdate(request);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.headerManagementService.updateDepartmentData(s.headerManagementService.groupId,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
      cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
      cacheUpdateRequest ? cacheUpdateRequest.filters : null)
      .subscribe(dto => {
        this.dataGrid.totalRecordCount = dto.totalInRecordSet;

        s.famisGridService.setCacheRecords(
          dto.departments,
          s.dataGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.numberInThisPayload,
          this.dataGrid.windowSize
        );
  });
  }
}
