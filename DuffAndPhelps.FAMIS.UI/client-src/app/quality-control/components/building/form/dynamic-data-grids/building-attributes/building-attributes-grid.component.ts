import { FamisGridService } from '../../../../../../_core/services/famis-grid.service';
import { TranslatedComponent } from '../../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../../_core/i18n/translation-base-keys';
import { BuildingsService } from '../../../../../services/buildings.service';
import { UpsertBuildingAttributeComponent } from './upsert-building-attribute.component';
import { HelperService } from '../../../../../../_core/services/helper.service';
import { WindowManager } from '../../../../../../_core/services/window-manager.service';
import { Component, OnInit, Input } from '@angular/core';
import { FamisGrid, FamisGridFeature } from '../../../../../../_models/shared/famis-grid-state.model';
import { ReferenceBuildingAdditionGroupDto } from '../../../../../../_api/_configuration/dtos/reference-building-addition-group.dto';
import { BuildingAdditionField } from '../../../../../../_models/building-addition-view.model';
import { BuildingDto, BuildingAttributeDto } from '../../../../../../_api/_runtime/dtos/building.dto';
import { AttributeTypeOption } from '../../../../../../_api/_configuration/dtos/attribute-types-and-codes-result.dto';
import { BuildingAttributeGridItemViewModel, BuildingAttributeValueViewModel } from '../../../../../../_models/building-form.model';
import { FieldType } from '../../../../../../_enums/field-type';
import { FamisGridActionEvent } from '../../../../../../_models/shared/famis-grid-action-event.model';
import { WindowOption } from '../../../../../../_models/window-option';
import { ModalFormEvent } from '../../../../../../_enums/modal-form-event';
import { SortDescriptor } from '@progress/kendo-data-query';

@Component({
  selector: 'building-attributes-grid',
  templateUrl: './building-attributes-grid.component.html'
})
export class BuildingAttributesGridComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  isReadOnly = false;
  private windowSize = 500;

  public additionalEquipmentGrid: FamisGrid;
  public groups = new Array<ReferenceBuildingAdditionGroupDto>();
  public flattendGroups = new Array<BuildingAdditionField>();
  buildingDto: BuildingDto;

  flattenedBuildingAttributeTypes = new Array<AttributeTypeOption>();

  @Input()
  buildingAttributes = new Array<BuildingAttributeGridItemViewModel>();

  constructor(
    private famisGridService: FamisGridService,
    private buildingService: BuildingsService,
    private windowManager: WindowManager,
    private helperService: HelperService,
  ) {}

  ngOnInit() {
    this.additionalEquipmentGrid = <FamisGrid>{
      height: 350,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: 'ConstructionCodes',
      hideTitle: true,
      supportedOperators: [FamisGridFeature.HideTableCounts],
      actions: this.isReadOnly ? ['View'] : ['Edit'],
      translationBaseKey: this.i18n.building,
      scrollingMode: 'normal'
    };

    this.additionalEquipmentGrid.columnHeaders = [
      {
        name: 'attributeTypeName',
        order: 0,
        displayName: 'Type',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: FieldType.String,
        format: '',
        width: '244',
      },
      {
        name: 'valueSummary',
        order: 0,
        displayName: 'Value',
        isSearchable: false,
        isFilterable: false,
        isSortable: true,
        isFacetable: false,
        isKey: false,
        isCustom: false,
        isEditable: false,
        fieldType: 'buildingAttribute',
        format: '',
        width: '244'
      }
    ];

    this.additionalEquipmentGrid.selectedHeaders = ['attributeTypeName', 'valueSummary'];

    this.buildingAttributes.forEach(attribute => {
      if (attribute.attributeValueOptions) {
        attribute.attributeValueOptions.forEach(option => {
          this.flattenedBuildingAttributeTypes.push(option);
        });
      }
    });

    this.updateGrid();

    this.buildingService.buildingRequest$.subscribe(buildingDto => {
      this.buildingDto = buildingDto;
      this.updateGrid();
    });
  }
 
  handleActionEvent(event: FamisGridActionEvent) {
    switch (event.action) {
      case 'Edit':
        this.editAttribute(event.item);
        break;

      case 'Delete':
        break;

      default:
        break;
    }
  }

  editAttribute(attributeToEdit: BuildingAttributeGridItemViewModel) {
    const upsertBuildingAttribute = this.windowManager.open(UpsertBuildingAttributeComponent, 'Edit Building Attribute', <WindowOption>{
      isModal: true
    });

    upsertBuildingAttribute.content.instance.attribute = attributeToEdit;
    upsertBuildingAttribute.content.instance.buildingDto = this.buildingDto;

    upsertBuildingAttribute.content.instance.result.subscribe(modalResult => {
      if (modalResult.action === ModalFormEvent.Save) {
        modalResult.selectedAttributes.forEach(attribute => {
          const index = this.buildingDto.buildingAttributes.findIndex(c => c.id === attribute.id);

          if (index !== -1) {
            this.buildingDto.buildingAttributes[index] = attribute;
          } else {
            attribute.isAdded = true;
            this.buildingDto.buildingAttributes.push(attribute);
          }
        });

        modalResult.attributesToDelete.forEach(attribute => {
          const index = this.buildingDto.buildingAttributes.findIndex(c => c.id === attribute.id);

          if (index !== -1) {
            this.buildingDto.buildingAttributes.splice(index, 1);
          }
        });
        this.buildingService.setBuildingRequestSource(this.buildingDto);
      }

      this.windowManager.close();
    });
  }

  private updateGrid(sortDescriptor?: SortDescriptor): void {
    const sortField = 'order';
    const sortDir = sortDescriptor && sortDescriptor[0] ? sortDescriptor[0].dir : 'asc';

    this.famisGridService.setCacheRecords(
      this.helperService.sortCollection(
        this.buildingDto ? this.mapValues(this.buildingAttributes) : this.buildingAttributes,
        sortField,
        sortDir
      ),
      this.additionalEquipmentGrid.gridId,
      this.famisGridService.defaultSkip,
      this.buildingAttributes.length,
      this.additionalEquipmentGrid.windowSize
    );
  }

  private mapValues(attributes: BuildingAttributeGridItemViewModel[]): Array<BuildingAttributeGridItemViewModel> {
    const mappedValues = new Array<BuildingAttributeGridItemViewModel>();

    attributes.forEach(a => {
      const values = this.buildingDto.buildingAttributes.filter(c => c.attributeType === a.attributeType);
      a.selectedValues = values;
      a.valueSummary = this.mapSummary(values);
      mappedValues.push(a);
    });

    return mappedValues;
  }

  private mapSummary(selectedAttributes: BuildingAttributeDto[]): Array<BuildingAttributeValueViewModel> {
    const attributeSummary = new Array<BuildingAttributeValueViewModel>();

    selectedAttributes.forEach(selectedAttribute => {
      const a = this.flattenedBuildingAttributeTypes.find(c => c.buildingAttributeCodeId === selectedAttribute.buildingAttributeCodeId);

      if (a) {
        attributeSummary.push(<BuildingAttributeValueViewModel>{
          description: a.description,
          value: selectedAttribute.value
        });
      }
    });

    return attributeSummary;
  }
}
