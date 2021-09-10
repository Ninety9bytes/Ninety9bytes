import { QualityControlService } from '../../../services/quality-control.service';
import { AssetFileInfoService } from '../../../../_core/services/asset-file-info-service';
import { QualityControlModes } from '../../../enums/quality-control-modes';
import { OnDestroy, OnInit, Component } from '@angular/core';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FilterDto } from '../../../../_api/dtos/inventory/filter.dto';
import { Term } from '../../../../_api/_runtime/dtos/processing-detail-request.dto';
import { FieldMetaDataDto } from '../../../../_api/dtos/inventory/field-meta-data.dto';
import { BreadCrumb } from '../../../../_models/breadcrumbs.model';

@Component({
  selector: 'mass-update-content',
  templateUrl: './mass-update-content.component.html'
})

export class MassUpdateContentComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  private destroyed$ = new Subject<any>();

  defaultFilterTerm: Array<FilterDto> = [
    <FilterDto> {
      term: <Term>{
        dataTarget: this.qualityControlService.dataTarget, field: '', value: ''
      },
      operation: 'noop'
    }
  ];
  filterMetaData: Array<FieldMetaDataDto>;
  replaceMetaData: Array<FieldMetaDataDto>;

  mode: QualityControlModes = QualityControlModes.Content;

  breadCrumbs = [
    <BreadCrumb>{ name: 'Quality Control', routerLink: '../../', queryParams: { mode: this.mode } },
    <BreadCrumb>{ name: 'Mass Update Criteria', routerLink: '../../MassUpdate/Content', queryParams: { mode: this.mode } },
    <BreadCrumb>{ name: 'View Results', routerLink: '../../MassUpdate/Results', queryParams: { mode: this.mode } }
  ];

  constructor(
    private qualityControlService: QualityControlService,
    private assetFileInfoService: AssetFileInfoService,
  ) {}

  ngOnInit() {
    const getFilterDataSource = this.qualityControlService.
    getSearchMetadataByGroupId(this.qualityControlService.groupId, this.qualityControlService.dataTarget);

    getFilterDataSource.pipe(takeUntil(this.destroyed$))
    .subscribe((filterDataSource) => {

      let assetFileFields = filterDataSource.fields;
      const internalColumns: string[] = this.assetFileInfoService.GetInternalColumns();
      assetFileFields = assetFileFields.filter(field => {
        return !internalColumns.includes(field.name);
      });
      this.filterMetaData = assetFileFields;

      const hiddenFields: string[] = this.assetFileInfoService.GetInternalAndHiddenFields();
      assetFileFields = filterDataSource.fields;
      assetFileFields = assetFileFields.filter(field => {
        return !hiddenFields.includes(field.name);
      });
      this.replaceMetaData = assetFileFields;
    });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
