import {ClientFile} from '../../models/client-file';
import { WindowRef } from '@agm/core/utils/browser-globals';
import { TranslateService } from '../../../../../node_modules/@ngx-translate/core';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { FileHeaders } from './default-files-header';
import { AlertService } from '../../../_core/services/alert.service';
import { UploadFileType } from '../../../_api/_runtime/enums/upload-type-enum';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../_models/shared/famis-grid-state.model';
import { Subject, Subscription } from 'rxjs';
import { ClientFileApiService } from '../../../_api/_runtime/services/client-files-api.service';
import { ConfigService } from '@ngx-config/core';
import { ActivatedRoute } from '@angular/router';
import { FamisGridActionEvent } from '../../../_models/shared/famis-grid-action-event.model';
import { SortDescriptor } from '@progress/kendo-data-query/dist/npm/sort-descriptor';
import { FamisGridCacheResult } from '../../../_models/shared/famis-grid-cache-result.model';
import { AssetSortTermDto } from '../../../_api/dtos/inventory/asset-search.dto';
import { State } from '@progress/kendo-data-query';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private defaultColumns = [
    'fileName',
    'fileSize',
    'uploadDate',
    'isPortalDocument',
    'uploadTypeName'
  ];
  public clientFilesGrid: FamisGrid;
  public finalizedDocumentsGrid: FamisGrid;

  private destroyed$ = new Subject();

  public acceptedFileTypes: Array<String> = this.configService.getSettings('acceptedFileTypes');
  public isLoading: boolean;
  public isUploading: boolean;
  private groupId: string;
  public isInternalDocument: boolean;
  public state: State;

  constructor (
    private clientFileService: ClientFileApiService,
    private windowRef: WindowRef, private configService: ConfigService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private famisGridService: FamisGridService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    this.state = {
      skip: 0,
      take: 84
    };
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.isLoading = true;
    this.finalizedDocumentsGrid = <FamisGrid>{
      height: 500,
      gridId: this.famisGridService.createGrid(),
      windowSize: 500,
      totalRecordCount: 0,
      name: '',
      supportedOperators: [FamisGridFeature.Sort],
      actions: ['Download', 'Remove'],
      columnHeaders: FileHeaders,
      selectedHeaders: this.defaultColumns,
      translationBaseKey: this.i18n.fileUpload
    };
    this.refreshFinalizedDocumentsGrid();
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  handleFinalizedFilesActionEvent(event: FamisGridActionEvent) {
    this.handleGridEvent(event);
  }

  private handleGridEvent(event: FamisGridActionEvent) {
    const item = event.item as ClientFile;
    if (event.action === 'Download') {
      this.downloadFile(item.id);
    }
    if (event.action === 'Remove') {
      this.deleteFile(item.id);
    }
  }

  private getUploadTypeName(type: UploadFileType) {
    switch (type) {
      case (UploadFileType.ClientUpload) : {
        return this.translate.instant(this.i18n.fileUpload + 'Client Upload');
      }
      case (UploadFileType.FinalizedDocument) : {
        return this.translate.instant(this.i18n.fileUpload + 'Finalized Document');
      }
      case (UploadFileType.ValuationReport) : {
        return this.translate.instant(this.i18n.fileUpload + 'Valuation Report');
      }
      case (UploadFileType.FloodPlainReport): {
        return this.translate.instant(this.i18n.fileUpload + 'Flood Plain Report');
      }
      default: return 'Unknown';
    }
  }

  private refreshFinalizedDocumentsGrid() {
    this.finalizedDocumentsGrid.loading = this.clientFileService.getGroupUplodFiles(this.groupId)
    .pipe(takeUntil(this.destroyed$))
    .subscribe(res => {
      res.forEach(document => {
        document.uploadTypeName = this.getUploadTypeName(document.uploadType);
      });
      this.finalizedDocumentsGrid.columnHeaders = FileHeaders,
      this.finalizedDocumentsGrid.selectedHeaders = this.defaultColumns;
      this.famisGridService.setCacheRecords(res, this.finalizedDocumentsGrid.gridId,
      this.famisGridService.defaultSkip,
      res.length,
      this.famisGridService.defaultTake);
      this.isInternalDocument = false;
    });
  }

  public uploadFile(file: File) {
    this.isUploading = true;
    this.clientFileService.uploadGroupFile(this.groupId, file, this.isInternalDocument, null, null).subscribe(res => {
      this.isUploading = false;
      if (!res.isPortalDocument) {
        this.alertService.warn(this.translate.instant('Document not linked to portal'));
        // 'No portal exists for this group. This document will not be associated to a portal.'
      }
      this.refreshFinalizedDocumentsGrid();
    });
  }

  public deleteFile(id: string) {
    this.isLoading = true;
    this.clientFileService.deleteFile(id).subscribe(res => {
      this.isLoading = false;
       this.refreshFinalizedDocumentsGrid();

    });
  }

  public downloadFile(id: string) {
    this.isLoading = true;
    this.clientFileService.getClientFile(id).subscribe(url => {
      this.isLoading = false;
      this.windowRef.getNativeWindow().open(url, '_blank');
    });
  }

  handleSortChanged(sort: SortDescriptor[]) {
    const s = this;
    const sortTerms = new Array<AssetSortTermDto>();
    const orderCount = 0;
    sort.forEach(c => {
      const sortTerm = <AssetSortTermDto>{
        termOrder: orderCount,
        sortDirection: c.dir === 'asc' ? 0 : 1,
        field: c.field
      };

      sortTerms.push(sortTerm);
    });

    this.famisGridService.currentSort[this.finalizedDocumentsGrid.gridId] = sortTerms;

    s.famisGridService
      .update(
        s.finalizedDocumentsGrid.gridId,
        s.state.skip,
        s.state.take,
        s.finalizedDocumentsGrid.totalRecordCount,
        s.famisGridService.currentSort[s.finalizedDocumentsGrid.gridId],
        true
      )
      .pipe(takeUntil(s.destroyed$))
      .subscribe(result => {
        s.updateCache(result);
      });
  }

  updateCache(request?: FamisGridCacheResult) {
    const s = this;

    const successCacheLoading = new Subscription();
    const errorCacheLoading = new Subscription();

    this.finalizedDocumentsGrid.cacheLoading = s.processCacheUpdate(request);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.clientFileService.updateGridData(s.groupId,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
      cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
      cacheUpdateRequest ? cacheUpdateRequest.sortTerms : null,
      cacheUpdateRequest ? cacheUpdateRequest.filters : null)
    .pipe(takeUntil(this.destroyed$))
    .subscribe(res => {
      res.forEach(document => {
        document.uploadTypeName = this.getUploadTypeName(document.uploadType);
      });
      this.finalizedDocumentsGrid.columnHeaders = FileHeaders,
      this.finalizedDocumentsGrid.selectedHeaders = this.defaultColumns;
      this.famisGridService.setCacheRecords(res, this.finalizedDocumentsGrid.gridId,
      this.famisGridService.defaultSkip,
      res.length,
      this.famisGridService.defaultTake);
      this.isInternalDocument = false;
    });
  }
}
