import { FamisGridService } from '../../../../../../_core/services/famis-grid.service';
import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { BuildingsService } from '../../../../../services/buildings.service';
import { HelperService } from '../../../../../../_core/services/helper.service';
import { UpsertOccupancyCodesComponent } from './upsert-occupancy-code.component';
import { WindowManager } from '../../../../../../_core/services/window-manager.service';
import { Component, OnInit, Input, ViewContainerRef } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../../../../_models/shared/famis-grid-state.model';
import { ReferenceBuildingAdditionGroupDto } from '../../../../../../_api/_configuration/dtos/reference-building-addition-group.dto';
import { BuildingAdditionField } from '../../../../../../_models/building-addition-view.model';
import { BuildingDto, OccupancyCodeDto } from '../../../../../../_api/_runtime/dtos/building.dto';
import { AttributeTypeOption } from '../../../../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { FieldType } from '../../../../../../_enums/field-type';
import { FamisGridActionEvent } from '../../../../../../_models/shared/famis-grid-action-event.model';
import { BuildingAttributeGridItemViewModel } from '../../../../../../_models/building-form.model';
import { WindowOption } from '../../../../../../_models/window-option';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';
import { SortDescriptor } from '@progress/kendo-data-query';
import { OccupancyCodeGridItemModel } from '../../../../../../_models/occupancy-code-grid-item-model';

@Component({
  selector: 'occupancy-codes-grid',
  templateUrl: './occupancy-codes-grid.component.html'
})
export class OccupancyCodesGridComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  isReadOnly = false;
  private windowSize = 250;

  public additionalEquipmentGrid: FamisGrid;
  public groups = new Array<ReferenceBuildingAdditionGroupDto>();
  public flattendGroups = new Array<BuildingAdditionField>();
  buildingDto: BuildingDto;

  @Input()
  occupancyCodeOptions = new Array<AttributeTypeOption>();

  constructor(
    private famisGridService: FamisGridService,
    private buildingService: BuildingsService,
    private windowManager: WindowManager,
    private helperService: HelperService,
    public container: ViewContainerRef
  ) {}

  ngOnInit() {
    this.additionalEquipmentGrid = <FamisGrid>{
      height: 155,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'occupancyCodes',
      hideTitle: true,
      supportedOperators: [FamisGridFeature.Sort, FamisGridFeature.HideTableCounts],
      actions: this.isReadOnly ? ['View'] : ['Edit', 'Delete'],
      translationBaseKey: this.i18n.building,
    };

    this.additionalEquipmentGrid.columnHeaders = [
      {
        name: 'description',
        order: 0,
        displayName: 'Occupancy Code',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: FieldType.String,
        format: ''
      },
      {
        name: 'storyHeight',
        order: 0,
        displayName: 'Story Height',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: FieldType.Double,
        format: ''
      },
      {
        name: 'percent',
        order: 0,
        displayName: 'Percent',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: FieldType.Double,
        format: ''
      }
    ];

    this.additionalEquipmentGrid.selectedHeaders = ['description', 'storyHeight', 'percent'];

    this.buildingService.buildingRequest$.subscribe(buildingDto => {
      if (buildingDto) {
        this.buildingDto = buildingDto;
        this.updateGrid();
      }
    });
  }

  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Edit':
        this.upsert(event.item);
        break;

      case 'Delete':
        const index = this.buildingDto.occupancyCodes.findIndex(c => c.buildingAttributeCodeId === event.item.id);
        this.buildingDto.occupancyCodes.splice(index, 1);

        this.buildingService.setBuildingRequestSource(this.buildingDto);

        break;

      default:
        break;
    }
  }

  upsert(itemToEdit?: BuildingAttributeGridItemViewModel) {
    const upsertOccupancyCodesModal = this.windowManager.open(
      UpsertOccupancyCodesComponent,
      itemToEdit ? 'Edit Occupancy Code' : 'Add Occupancy Code',
      <WindowOption>{
        isModal: true
      }
    );

    upsertOccupancyCodesModal.window.instance.focus();

    upsertOccupancyCodesModal.content.instance.occupancyCode = itemToEdit;
    upsertOccupancyCodesModal.content.instance.modalTitle = itemToEdit ? 'Edit' : 'Add';

    upsertOccupancyCodesModal.content.instance.buildingDto = this.buildingDto;
    upsertOccupancyCodesModal.content.instance.options = this.occupancyCodeOptions;

    upsertOccupancyCodesModal.content.instance.result.subscribe(modalResult => {
      if (modalResult.action === ModalFormEvent.Save) {
        const index = this.buildingDto.occupancyCodes.findIndex(c => c.id === modalResult.occupancyCode.id);

        if (index !== -1) {
          this.buildingDto.occupancyCodes[index] = modalResult.occupancyCode;
        } else {
          this.buildingDto.occupancyCodes.push(modalResult.occupancyCode);
        }

        this.buildingService.setBuildingRequestSource(this.buildingDto);
      }

      this.windowManager.close();
    });
  }

  addOccupancyCode() {
    this.upsert();
  }

  private updateGrid(sortDescriptor?: SortDescriptor): void {
    const sortField = sortDescriptor && sortDescriptor[0] ? sortDescriptor[0].field : 'description';
    const sortDir = sortDescriptor && sortDescriptor[0] ? sortDescriptor[0].dir : 'asc';

    this.famisGridService.setCacheRecords(
      this.helperService.sortCollection(this.mapvalues(this.buildingDto.occupancyCodes), sortField, sortDir),
      this.additionalEquipmentGrid.gridId,
      this.famisGridService.defaultSkip,
      this.buildingDto.occupancyCodes.length,
      this.additionalEquipmentGrid.windowSize
    );
  }

  private mapvalues(occupancyCodes: OccupancyCodeDto[]) {
    const gridItems = new Array<OccupancyCodeGridItemModel>();

    occupancyCodes.forEach(occupancyCode => {
      const option = this.occupancyCodeOptions.find(c => c.buildingAttributeCodeId === occupancyCode.buildingAttributeCodeId);

      if (option) {
        gridItems.push(<OccupancyCodeGridItemModel>{
          id: occupancyCode.id,
          description: option.description,
          percent: occupancyCode.percent,
          storyHeight: occupancyCode.storyHeight,
          buildingAttributeCodeId: occupancyCode.buildingAttributeCodeId
        });
      }
    });

    return gridItems;
  }
}
