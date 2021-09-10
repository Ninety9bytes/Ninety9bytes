import { ConfirmModalComponent } from '../../_shared/components/confirm-modal.component';
import { FamisGridService } from '../../_core/services/famis-grid.service';
import { HeaderManagementService } from '../services/header-management.service';
import { AlertService } from '../../_core/services/alert.service';
import { HelperService } from '../../_core/services/helper.service';
import { SiteUpsertComponent } from './actions/site-upsert.component';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../_models/shared/famis-grid-state.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { SiteDto } from '../../_api/_runtime/dtos/site.dto';
import { ModalProperties } from '../../_models/modal-properties.model';
import { FamisGridCacheResult } from '../../_models/shared/famis-grid-cache-result.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'header-management-site',
  templateUrl: './header-management-site.component.html'
})
export class HeaderManagementSiteComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public dataGrid: FamisGrid;
  public isLoading = false;
  public action: string;

  private windowSize = 500;
  private handleLocalError = true;

  @ViewChild(SiteUpsertComponent, { static: false })
  siteUpsertComponent: SiteUpsertComponent;

  constructor(
    private famisGridService: FamisGridService,
    private headerManagementService: HeaderManagementService,
    private modalService: NgbModal,
    private alertService: AlertService,
    private helperService: HelperService,
    private translationService: TranslationManager
  ) {}

  ngOnInit() {

    this.dataGrid = <FamisGrid>{
      height: 330,
      gridId: this.famisGridService.createGrid(),
      name: 'site-tab',
      windowSize: this.windowSize,
      totalRecordCount: 0,
      supportedOperators:  [FamisGridFeature.Sort, FamisGridFeature.Filter],
      actions: ['Edit', 'Delete'],
      translationBaseKey: this.i18n.dataImport,
      hideTitle: true
    };

    this.dataGrid.loading = this.headerManagementService.getSiteMetadata().subscribe(metaData => {
      console.dir(metaData);

    this.dataGrid.columnHeaders = this.helperService.mapHeaders(metaData.fields, []);
       this.dataGrid.selectedHeaders = ['siteName', 'siteNumber', 'memberName'];
  
 });
  }

  ngOnDestroy() {}

  handleActionEvent(actionEvent: FamisGridActionEvent) {
    if (actionEvent.action === 'Delete') {
      this.delete(actionEvent.item);
    }

    if (actionEvent.action === 'Edit') {
      this.siteUpsertComponent.open(actionEvent.item);
    }
  }

  handleAction(response: string) {
    this.action = response;
  }

  handleCreateorModified(response: SiteDto) {
    this.alertService.success('Site {{siteName}} has been '
     + (this.action === 'Edit' ? 'updated.' : 'created.'), null, {siteName: response.siteName});

    // Call to update grid
    this.updateCache();
  }

  delete(item: SiteDto) {
    const modal = this.modalService.open(ConfirmModalComponent);
    const modalOptions = <ModalProperties>{
        heading: {
          key: 'Delete Site',
        },
        body: {
          key: `Are you sure you wish to delete '{{itemSiteName}}'?`,
          params: {itemSiteName: item.siteName},
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

    modal.result.then(confirm => {
      this.headerManagementService.deleteSite(item.id, this.handleLocalError).subscribe(result => {
        if (result) {
          this.updateCache();
          this.alertService.success('{{description}} has been deleted.', null, { description: item.siteName });
          this.dataGrid.loading = this.processCacheUpdate();
        }
      },
        error => {
          switch (error.status) {
            case 409:
              this.alertService.warn('{{siteName}} cannot be deleted without first removing related buildings.',
                null, { siteName: item.siteName });
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

    return this.headerManagementService.updateSiteData(s.headerManagementService.groupId,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
      cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
      cacheUpdateRequest ? cacheUpdateRequest.filters : null)
      .subscribe(dto => {
        this.dataGrid.totalRecordCount = dto.totalInRecordSet;

        s.famisGridService.setCacheRecords(
          dto.sites,
          s.dataGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.numberInThisPayload,
          this.dataGrid.windowSize
        );
      });
  }
}
