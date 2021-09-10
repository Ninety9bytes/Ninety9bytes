import { FamisGridComponent } from '../../../../../../_shared/components/famis-grid.component';
import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { FamisGridService } from '../../../../../../_core/services/famis-grid.service';
import { UpsertCustomAdditionComponent } from './actions/upsert-customaddition.component';
import { RemoveCustomAdditionComponent } from './actions/remove-customaddition.component';
import { customAdditionsHeaders } from '../../../../../../processing/default-values/custom-addition-headers';
import { BuildingsService } from '../../../../../services/buildings.service';
import { customAdditionFormModel } from '../../form-models/custom-addition-model';
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
  selector: 'custom-additions-grid',
  templateUrl: './custom-additions-grid.component.html'
})
export class CustomAdditionsGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input()
  buildingDto: BuildingDto;

  public customAdditionsGrid: FamisGrid;
  public buildingId: string;

  @ViewChild(FamisGridComponent, {static: true}) famisGrid: FamisGridComponent;

  private windowSize = 500;
  private destoryed$ = new Subject();

  constructor(
    private famisGridService: FamisGridService,
    public windowManager: WindowManager,
    private buildingService: BuildingsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.buildingId = this.route.snapshot.paramMap.get('buildingId');

    this.customAdditionsGrid = <FamisGrid>{
      height: 175,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'customAdditions',
      hideTitle: true,
      supportedOperators: [FamisGridFeature.HideTableCounts],
      actions: ['Edit', 'Remove'],
      translationBaseKey: this.i18n.customAdditions,
    };

    this.customAdditionsGrid.columnHeaders = customAdditionsHeaders;
    this.customAdditionsGrid.selectedHeaders = ['description', 'cost'];
    this.processCacheUpdate();
  }

  ngOnDestroy() {
    this.destoryed$.next();
  }

  onFormActionEvent(response: FormActionEvent, modal: WindowRef, itemIndex: number) {
    switch (response.action) {
      case FormAction.Save:
        this.buildingDto.customAdditions.push(response.dto);
        this.updateBuilding();
        break;
      case FormAction.Edit:
        const index = this.buildingDto.customAdditions.findIndex(a => a.id === response.dto.id);
        this.buildingDto.customAdditions[index] = response.dto;
        this.updateBuilding();
        break;
      case FormAction.Remove:
        this.buildingDto.customAdditions.splice(itemIndex, 1);
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
      this.customAdditionsGrid.loading = this.buildingService
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
        const upsertCustomAdditionModal = this.windowManager.open(UpsertCustomAdditionComponent, 'Edit Custom Addition', <WindowOption>{
          isModal: true
        });

        upsertCustomAdditionModal.content.instance.fieldMetaData = customAdditionFormModel;
        upsertCustomAdditionModal.content.instance.customAdditionDto = event.item;
        upsertCustomAdditionModal.content.instance.formAction = FormAction.Edit;
        upsertCustomAdditionModal.content.instance.submitResponse.subscribe(response => {
          s.onFormActionEvent(response, upsertCustomAdditionModal, event.rowIndex);
        });

        break;

      case 'Remove':
        const removeCustomAdditionModal = this.windowManager.open(RemoveCustomAdditionComponent, 'Remove Custom Addition', <
          WindowOption
        >{
          isModal: true
        });

        removeCustomAdditionModal.content.instance.fieldMetaData = customAdditionFormModel;
        removeCustomAdditionModal.content.instance.customAdditionDto = event.item;
        removeCustomAdditionModal.content.instance.submitResponse.subscribe(response => {
          s.onFormActionEvent(response, removeCustomAdditionModal, event.rowIndex);
        });

        break;
      default:
        break;
    }
  }

  addCustomAddition() {
    const s = this;

    const addCustomAdditionModal = this.windowManager.open(UpsertCustomAdditionComponent, 'Add Custom Addition', <WindowOption>{
      isModal: true
    });

    addCustomAdditionModal.content.instance.fieldMetaData = customAdditionFormModel;
    addCustomAdditionModal.content.instance.formAction = FormAction.Save;
    addCustomAdditionModal.content.instance.submitResponse.subscribe(response => {
      s.onFormActionEvent(response, addCustomAdditionModal, 0);
    });
  }

  updateCache(request?: FamisGridCacheResult) {
    this.processCacheUpdate(request);
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): void {
    if (this.buildingDto) {
      this.customAdditionsGrid.totalRecordCount = this.buildingDto.customAdditions.length;

      this.famisGridService.setCacheRecords(
        this.buildingDto.customAdditions,
        this.customAdditionsGrid.gridId,
        0,
        this.buildingDto.customAdditions.length,
        this.customAdditionsGrid.windowSize
      );
    }
  }
}
