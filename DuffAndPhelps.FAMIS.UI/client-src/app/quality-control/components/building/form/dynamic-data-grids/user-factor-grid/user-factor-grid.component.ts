import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { FamisGridService } from '../../../../../../_core/services/famis-grid.service';
import { userFactorHeaders } from '../../../../../../processing/default-values/user-factor-headers';
import { UpsertUserFactorComponent } from './actions/upsert-userfactor.component';
import { BuildingsService } from '../../../../../services/buildings.service';
import { userFactorFormModel } from '../../form-models/user-factor-model';
import { FamisGridComponent } from '../../../../../../_shared/components/famis-grid.component';
import { WindowManager } from '../../../../../../_core/services/window-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { BuildingDto } from '../../../../../../_api/_runtime/dtos/building.dto';
import { FamisGrid, FamisGridFeature } from '../../../../../../_models/shared/famis-grid-state.model';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormActionEvent } from '../../../../../../_models/form-action-event.model';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { FormAction } from '../../../../../../_enums/form-action';
import { FamisGridActionEvent } from '../../../../../../_models/shared/famis-grid-action-event.model';
import { WindowOption } from '../../../../../../_models/window-option';
import { FamisGridCacheResult } from '../../../../../../_models/shared/famis-grid-cache-result.model';

@Component({
  selector: 'user-factor-grid',
  templateUrl: './user-factor-grid.component.html'
})
export class UserFactorGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input()
  buildingDto: BuildingDto;

  public userFactorsGrid: FamisGrid;
  public displayCostReplacementNew: number;
  public buildingId: string;

  @ViewChild(FamisGridComponent, {static: true}) famisGrid: FamisGridComponent;

  private windowSize = 300;
  private destoryed$ = new Subject();

  constructor(
    private famisGridService: FamisGridService,
    public windowManager: WindowManager,
    private buildingService: BuildingsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.paramMap.get('buildingId');

    this.userFactorsGrid = <FamisGrid>{
      height: 150,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'userFactor',
      hideTitle: true,
      supportedOperators: [FamisGridFeature.HideTableCounts],
      actions: ['Edit', 'Remove'],
      translationBaseKey: this.i18n.userFactors,
    };

    this.userFactorsGrid.columnHeaders = userFactorHeaders;
    this.userFactorsGrid.selectedHeaders = ['description', 'factor'];
    this.processCacheUpdate();
  }

  ngOnDestroy() {
    this.destoryed$.next();
  }

  onFormActionEvent(response: FormActionEvent, modal: WindowRef, itemIndex: number) {
    switch (response.action) {
      case FormAction.Save:
        this.buildingDto.userFactors.push(response.dto);
        this.updateBuilding();
        break;
      case FormAction.Edit:
        const index = this.buildingDto.userFactors.findIndex(a => a.id === response.dto.id);
        this.buildingDto.userFactors[index] = response.dto;
        this.updateBuilding();
        break;
      case FormAction.Cancel:
        modal.close();
        break;
      default:
        throw new Error(`Action ${response.action} not implemented.`);
    }
    modal.close();
  }

  updateBuilding() {
    if (this.buildingId) {
      this.userFactorsGrid.loading = this.buildingService
        .updateBuilding(this.buildingId, this.buildingDto)
        .pipe(takeUntil(this.destoryed$))
        .subscribe(result => {
          this.buildingService.setBuildingRequestSource(result);
          this.buildingDto = result;
          this.updateCache();
        });
    } else {
      this.buildingService.setBuildingRequestSource(this.buildingDto);
      this.updateCache();
    }
  }

  handleActionEvent(event: FamisGridActionEvent) {
    const s = this;
    switch (event.action) {
      case 'Edit':
        const upsertUserFactorModal = this.windowManager.open(UpsertUserFactorComponent, 'Edit User Factor', <WindowOption>{
          isModal: true
        });

        upsertUserFactorModal.content.instance.fieldMetaData = userFactorFormModel;
        upsertUserFactorModal.content.instance.userFactorDto = event.item;
        upsertUserFactorModal.content.instance.formAction = FormAction.Edit;
        upsertUserFactorModal.content.instance.submitResponse.subscribe(response => {
          s.onFormActionEvent(response, upsertUserFactorModal, event.rowIndex);
        });

        break;

      case 'Remove':

      this.buildingDto.userFactors.splice(event.rowIndex, 1);
      this.updateBuilding();
        break;
      default:
        break;
    }
  }

  addUserFactor() {
    const s = this;

    const addUserFactorModal = this.windowManager.open(UpsertUserFactorComponent, 'Add User Factor', <WindowOption>{
      isModal: true
    });

    addUserFactorModal.content.instance.fieldMetaData = userFactorFormModel;
    addUserFactorModal.content.instance.formAction = FormAction.Save;
    addUserFactorModal.content.instance.submitResponse.subscribe(response => {
      s.onFormActionEvent(response, addUserFactorModal, 0);
    });
  }

  updateCache(request?: FamisGridCacheResult) {
    this.processCacheUpdate(request);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): void {
    if (this.buildingDto) {
      this.userFactorsGrid.totalRecordCount = this.buildingDto.userFactors.length;

      this.famisGridService.setCacheRecords(
        this.buildingDto.userFactors,
        this.userFactorsGrid.gridId,
        0,
        this.buildingDto.userFactors.length,
        this.userFactorsGrid.windowSize
      );
    }
  }
}
