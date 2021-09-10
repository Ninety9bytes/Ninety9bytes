import { QualityControlModes } from '../../../enums/quality-control-modes';
import { QualityControlService } from '../../../services/quality-control.service';
import { OnDestroy, OnInit, Component } from '@angular/core';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { BuildingInfoService } from '../../../../_core/services/building-info-service';
import { takeUntil } from 'rxjs/operators';
import { FilterDto } from '../../../../_api/_runtime/dtos/filter.dto';
import { FieldMetaDataDto } from '../../../../_api/_runtime/dtos/field-meta-data.dto';
import { BreadCrumb } from '../../../../_models/breadcrumbs.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'mass-update-building',
  templateUrl: './mass-update-building.component.html'
})

export class MassUpdateBuildingComponent implements OnDestroy, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  defaultFilterTerm: Array<FilterDto> = [];
  filterMetaData: Array<FieldMetaDataDto>;
  replaceMetaData: Array<FieldMetaDataDto>;

  mode: QualityControlModes = QualityControlModes.Buildings;

  breadCrumbs = [
    <BreadCrumb>{ name: 'Quality Control', routerLink: '../../', queryParams: { mode: this.mode} },
    <BreadCrumb>{ name: 'Mass Update Criteria', routerLink: '../../MassUpdate/Building', queryParams: { mode: this.mode } },
    <BreadCrumb>{ name: 'View Results', routerLink: '../../MassUpdate/Results', queryParams: { mode: this.mode } }
  ];

  private destroyed$ = new Subject<any>();


  constructor(
    private qualityControlService: QualityControlService,
    private buildingInfoService: BuildingInfoService
  ) { }


  ngOnInit() {

    this.qualityControlService.getBuildingSearchMetadataByGroupId(this.qualityControlService.groupId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(buildingMetadata => {

        const buildingFields = buildingMetadata.fields;

        this.filterMetaData = this.GetFilteredFieldData(buildingFields, this.buildingInfoService.GetInternalColumns());
        this.replaceMetaData = this.GetFilteredFieldData(buildingFields, this.buildingInfoService.GetReadonlyAndHiddenFields());
    });

  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private GetFilteredFieldData(fields: Array<FieldMetaDataDto>, excluded: string[]): Array<FieldMetaDataDto> {
    let res = fields;
    res = res.filter(field => {
      return !excluded.includes(field.name);
    });
    res = res.sort(function(a, b){
      if (a.displayName < b.displayName) { return -1; }
      if (a.displayName > b.displayName) { return 1; }
      return 0;
    });

    res.forEach(field => {
      if (field.name === 'inspectionDate') {
        field.displayName = 'Date of Inspection';
      }
    });
    return res;
  }

}
