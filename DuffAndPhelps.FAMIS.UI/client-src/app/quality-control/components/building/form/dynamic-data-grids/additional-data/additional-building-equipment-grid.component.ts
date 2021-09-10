import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { FamisGridService } from '../../../../../../_core/services/famis-grid.service';
import { AdditionalDataService } from '../../../../../services/additional-data/additional-data.service';
import { AdditionalDataGridService } from '../../../../../services/additional-data/additional-data-grid.service';
import { BuildingsService } from '../../../../../services/buildings.service';
import { UpsertBuildingAdditionComponent } from './upsert-building-addition.component';
import { WindowManager } from '../../../../../../_core/services/window-manager.service';
import { Component, Input, OnInit } from '@angular/core';
import { BuildingDto, BuildingSelectedAddition } from '../../../../../../_api/_runtime/dtos/building.dto';
import { FamisGrid, FamisGridFeature } from '../../../../../../_models/shared/famis-grid-state.model';
import { ReferenceBuildingAdditionGroupDto } from '../../../../../../_api/_configuration/dtos/reference-building-addition-group.dto';
import { BuildingAdditionField, BuildingAdditionViewModel,
  BuildingAdditionValueSummary } from '../../../../../../_models/building-addition-view.model';
import { WindowOption } from '../../../../../../_models/window-option';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';
import { FamisGridActionEvent } from '../../../../../../_models/shared/famis-grid-action-event.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'additional-building-equipment-grid',
  templateUrl: './additional-building-equipment-grid.component.html'
})
export class AdditionalBuildingEquipmentComponent implements OnInit, TranslatedComponent {
  @Input()
  buildingDto: BuildingDto;

  i18n = TranslationBaseKeys;

  isReadOnly = false;
  private windowSize = 500;

  groupId: string;

  selectedAdditions = new Array<BuildingSelectedAddition>();

  public additionalEquipmentGrid: FamisGrid;
  public groups = new Array<ReferenceBuildingAdditionGroupDto>();
  public flattendGroups = new Array<BuildingAdditionField>();

  constructor(
    private famisGridService: FamisGridService,
    private additionalDataService: AdditionalDataService,
    private additionalDataGridService: AdditionalDataGridService,
    public windowManager: WindowManager,
    private buildingService: BuildingsService,
  ) {}

  ngOnInit() {
    this.additionalEquipmentGrid = <FamisGrid>{
      height: 300,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'additionalEquipmentGrid',
      hideTitle: true,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.HideTableCounts],
      actions: this.isReadOnly ? ['View'] : ['Edit', 'Delete'],
      translationBaseKey: this.i18n.building,
      scrollingMode: 'normal',
    };

    this.additionalEquipmentGrid.columnHeaders = [
      {
        name: 'description',
        order: 0,
        displayName: 'Description',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: 'template',
        format: ''
      }
    ];
    this.additionalEquipmentGrid.selectedHeaders = ['description'];

    this.additionalDataService.initBuildingAdditionGroups();

    this.additionalEquipmentGrid.loading = this.additionalDataService.buildingAdditionGroups$.subscribe(groups => {
      this.groups = groups;

      this.flattendGroups = this.additionalDataService.flattenedData;

      if (this.buildingDto) {
        this.updateAdditionsGrid();
      }
    });

    this.buildingService.buildingRequest$.subscribe(buildingDto => {
      if (buildingDto) {
        this.additionalEquipmentGrid.loading = this.updateAdditionsGrid();
      }
    });
  }

  addAddition() {
    const addAdditionModal = this.windowManager.open(UpsertBuildingAdditionComponent, 'Add Additional Building Equipment and Features',
    <WindowOption>{ isModal: true });

    addAdditionModal.content.instance.groups = this.groups;
    addAdditionModal.content.instance.addition = <BuildingAdditionViewModel>{
      groupDescription: '',
      categoryCode: null,
      categoryDescription: ''
    };

    addAdditionModal.content.instance.buildingDto = this.buildingDto;
    addAdditionModal.content.instance.referenceData = this.flattendGroups;

    addAdditionModal.result.subscribe(result => {
      if (addAdditionModal.content.instance.action === ModalFormEvent.Save) {
        this.mapCriterion(addAdditionModal.content.instance.result.criterion);

        this.buildingService.setBuildingRequestSource(this.buildingDto);
      }
    });

    addAdditionModal.content.instance.result.subscribe(modalResult => {
      if (modalResult.action === ModalFormEvent.Save) {
        this.mapCriterion(modalResult.criterion);

        this.buildingService.setBuildingRequestSource(this.buildingDto);
      }

      this.windowManager.close();
    });
  }

  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Edit':
        const additionToEdit = this.buildingDto.buildingSelectedAdditions.find(c => c.id === event.item.description.id);

        if (additionToEdit) {
          const editAdditionModal = this.windowManager.open(
            UpsertBuildingAdditionComponent,
            'Edit Additional Building Equipment and Features',
            <WindowOption>{ isModal: true }
          );

          editAdditionModal.content.instance.groups = this.groups;
          editAdditionModal.content.instance.addition = additionToEdit;

          editAdditionModal.content.instance.buildingDto = this.buildingDto;
          editAdditionModal.content.instance.referenceData = this.flattendGroups;

          editAdditionModal.content.instance.result.subscribe(modalResult => {
            if (modalResult.action === ModalFormEvent.Save) {
              if (modalResult.criteriaToDelete) {
                this.deleteAdditions(modalResult.criteriaToDelete);
              }

              this.mapCriterion(modalResult.criterion);

              this.buildingService.setBuildingRequestSource(this.buildingDto);
            }

            this.windowManager.close();
          });
        }

        break;

      case 'Delete':
        this.deleteAdditions(event.item.description.criteriaSummary);

        this.buildingService.setBuildingRequestSource(this.buildingDto);

        break;

      default:
        break;
    }
  }

  private updateAdditionsGrid(): Subscription {
    const s = this;

    return this.additionalDataGridService.initBuildingAdditionGrid(this.buildingDto, this.flattendGroups).subscribe(result => {
      this.additionalEquipmentGrid.totalRecordCount = result.length;

      s.famisGridService.setCacheRecords(
        this.mapToDescription(result),
        s.additionalEquipmentGrid.gridId,
        s.famisGridService.defaultSkip,
        result.length,
        this.additionalEquipmentGrid.windowSize
      );
    });
  }

  private mapToDescription(additions: BuildingAdditionViewModel[]): Array<any> {
    const descriptions = new Array<any>();
    const cost = new Array<any>();

    additions.forEach(addition => {
      descriptions.push({ description: addition });
    });

    return descriptions;
  }

  private mapCriterion(criterion: Array<BuildingSelectedAddition>) {
    criterion.forEach((criteria, i) => {
      if (i < criterion.length - 1) {
        criteria.childAdditionCriterionId = criterion[i + 1] ? criterion[i + 1].id : null;
      }

      const index = this.buildingDto.buildingSelectedAdditions.findIndex(c => c.id === criteria.id);

      if (index !== -1) {
        this.buildingDto.buildingSelectedAdditions[index] = criteria;
      } else {
        this.buildingDto.buildingSelectedAdditions.push(criteria);
      }
    });
  }

  deleteAdditions(criteriaSummary: Array<BuildingAdditionValueSummary>) {
    criteriaSummary.forEach(criteria => {
      const index = this.buildingDto.buildingSelectedAdditions.findIndex(c => c.id === criteria.id);

      if (index !== -1) {
        this.buildingDto.buildingSelectedAdditions.splice(index, 1);
      }
    });
  }
}
