import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { GroupSaveService } from '../../services/group-save-service';
import { groupSaveHeaders, defaultGroupSaveHeaders } from '../default-values/default-header';
import { AlertService } from '../../../_core/services/alert.service';
import { RestoreModalComponent } from './restore-modal.component';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { LocalTimePipe } from '../../../_shared/pipes/local-time.pipe';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { FamisGrid } from '../../../_models/shared/famis-grid-state.model';
import { ActivatedRoute } from '@angular/router';
import { GroupSave } from '../../../_models/group-save.model';
import { FamisGridActionEvent } from '../../../_models/shared/famis-grid-action-event.model';

@Component({
  selector: 'group-save-component',
  templateUrl: './group-save.component.html'
})
export class GroupSaveComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private destroyed$ = new Subject<any>();
  private windowSize = 500;
  private initWindowSize = 84;
  private defaultSkip = 0;
  private groupId: string;
  public savePointGrid: FamisGrid;
  public savePointName: string;
  public isDuplicateName = false;
  public saveClicked = false;

  @ViewChild(RestoreModalComponent, { static: false })
  restoreModalComponent: RestoreModalComponent;

  constructor(
    private famisGridService: FamisGridService,
    private groupSaveService: GroupSaveService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.famisGridService.resetCache();
    this.groupSaveService.clearGroupSave();
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.groupSaveService.groupId = this.groupId;
    this.savePointGrid = <FamisGrid>{
      gridData: this.groupSaveService.savePointGridData$,
      gridId: this.famisGridService.createGrid(),
      columnHeaders: groupSaveHeaders,
      selectedHeaders: defaultGroupSaveHeaders,
      windowSize: this.windowSize,
      name: '',
      totalRecordCount: 0,
      height: 350,
      dataSource: this.groupSaveService.dataTarget,
      supportedOperators: [],
      actions: ['Restore'],
      translationBaseKey: this.i18n.admin
    };

    const getSuccessfulRecords = this.groupSaveService.updateGroupSaveData(this.groupId, this.defaultSkip, this.initWindowSize);
    const loading = getSuccessfulRecords.subscribe(successfulRecords => {
      if (successfulRecords) {
        this.savePointGrid.totalRecordCount = successfulRecords.length;
        this.groupSaveService.setSavePointGridDataSource(successfulRecords);
        if (successfulRecords.length > 0) {
          this.famisGridService.setCacheRecords(
            successfulRecords,
            this.savePointGrid.gridId,
            0,
            successfulRecords.length,
            this.initWindowSize
          );
        }
      }
    });
    this.savePointGrid.loading = loading;
  }

  updateCache() {
    const getSuccessfulRecords = this.groupSaveService.updateGroupSaveData(this.groupId, this.defaultSkip, this.initWindowSize);
    const loading = getSuccessfulRecords.subscribe(successfulRecords => {
      if (successfulRecords) {
        this.savePointGrid.totalRecordCount = successfulRecords.length;
        this.groupSaveService.setSavePointGridDataSource(successfulRecords);
        if (successfulRecords.length > 0) {
          this.famisGridService.setCacheRecords(
            successfulRecords,
            this.savePointGrid.gridId,
            0,
            successfulRecords.length,
            this.initWindowSize
          );
        }
      }
    });
    this.savePointGrid.loading = loading;
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  onSubmit(form: any) {
    this.saveClicked = true;
    if (this.savePointName) {
      this.groupSaveService.setGroupSavePoints(this.groupSaveService.groupId, this.savePointName).subscribe(result => {
        if (result) {
          if (result.code === 0) {
            this.savePointName = '';
            this.updateCache();
            this.isDuplicateName = false;
          } else if (result.code === 2) {
            this.isDuplicateName = true;
          }
        }
      });
    }
    this.saveClicked = false;
  }

  handleAddOrUpdate(responseFromModal: GroupSave) {
    // console.log(responseFromModal);
  }

  handleAction(responseFromModal: GroupSave) {
    this.updateCache();
    if (responseFromModal) {
      this.alertService.success('Save/Restore successfully completed');
    }
  }

  handleActionEvent(actionEvent: FamisGridActionEvent) {
    if (actionEvent.action === 'Restore') {
      const modall = this.restoreModalComponent.open(actionEvent.item);
    }
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
