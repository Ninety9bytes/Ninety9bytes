import { TranslatedComponent } from '../i18n/translated-component';
import { TranslationBaseKeys } from '../i18n/translation-base-keys';
import { TranslationManager } from '../i18n/translation-manager';
import { SearchRecordDto } from '../../_api/dtos/inventory/search-response.dto';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnumOptionDto } from '../../_api/_configuration/dtos/enum-option.dto';
import { AssetDto } from '../../_api/_runtime/dtos/asset.dto';
import { Asset } from '../../_models/asset.model';
import { FieldOption } from '../../_models/field-option.model';
import { SettingsApiService } from '../../_api/_runtime/services/settings-api.service';
import { GroupSettingDto } from '../../_api/_runtime/dtos/group-setting.dto';
import { SettingType } from '../../_enums/setting-type';

@Injectable()
export class AssetFileInfoService implements TranslatedComponent {
  i18n = TranslationBaseKeys;
  public referenceData = new BehaviorSubject<Array<Array<EnumOptionDto>>>(new Array<Array<EnumOptionDto>>());
  private userSettingdto = new Array<GroupSettingDto>();
  settingName: string;

  constructor(private translateService: TranslationManager, private settingsApiService: SettingsApiService) {}

  private hiddenColumns = [
    'assetId',
    'isMatched',
    'isParent',
    'isChild',
    'parentChildMatches',
    'matchTypes',
    'matches',
    'matchCodeId',
    'parentId',
    'matchId',
    'allocatedValue',
    'allocationId',
    'id',
    'updatedTimeStamp',
    'assetFileId',
    'sourceRecordId',
    'groupId',
    'inventoryImageUrl2',
    'inventoryImageUrl3',
    'inventoryImageUrl4',
    'inventoryImageUrl5',
    'inventoryImageUrl6',
    'inventoryImageUrl7',
    'buildingId',
  ];

  // Read only fields

  public readOnlyFields = [
    'depreciationAsOfDate'
  ]

  private defaultColumns = [
    'displayId',
    'assetTagNumber',
    'activityCode',
    'siteNumber',
    'buildingNumber',
    'accountNumber',
    'classCode',
    'description',
    'manufacturer',
    'modelNumber',
    'serialNumber',
    'acquisitionDate',
    'historicalCost',
    'costReplacementNew'
  ];

  private defaultColumnsMassUpdate = [
    'displayId',
    'serialNumber',
    'assetTagNumber',
    'description',
    'manufacturer',
    'building'
  ];

  private defaultColumnsDuplicateCheck = [
    'displayId',
    'manufacturer',
    'modelNumber',
    'serialNumber'
  ];

  private hiddenFields = [
    'siteName',
    'buildingName',
  ];

  private nonTranslatedFields = [
    'accountId',
    'departmentId'
  ];

  private accountFieldNames = [
    'accountNumber',
    'accountDescription'
  ];

  private departmentFieldNames = [
    'departmentName',
    'departmentNumber'
  ];

  public GetAccountColumns(): Array<string> {
    return this.accountFieldNames;
  }

  public GetDepartmentColumns(): Array<string> {
    return this.departmentFieldNames;
  }

  public GetInternalColumns(): Array<string> {
    return this.hiddenColumns;
  }

  public GetDefaultColumns(): Array<string> {
    return this.defaultColumns;
  }

  public GetDefaultMassUpdateColumns(): Array<string> {
    return this.defaultColumnsMassUpdate;
  }

  public GetDefaultDuplicateCheckColumns(): Array<string> {
    return this.defaultColumnsDuplicateCheck;
  }

  public GetHiddenFields(): Array<string> {
    return this.hiddenFields;
  }

  public GetInternalAndHiddenFields(): Array<string> {
    return this.hiddenColumns.concat(this.hiddenFields);
  }

  public GetNonTranslatedFields(): Array<string> {
    return this.nonTranslatedFields.concat(this.nonTranslatedFields);
  }
  public mapEnums(assetDtos?: Array<AssetDto>, uiAssets?: Array<Asset>, searchRecordDtos?: Array<SearchRecordDto>):
  any {

    let assets = new Array<any>();
    const s = this;

    if (assetDtos) {
      assets = assetDtos;
    } else if (uiAssets) {
      assets = uiAssets;
    } else {
      assets = searchRecordDtos;
    }

    const referenceData = this.referenceData.getValue();

    assets.forEach(asset => {
      const activityCode = referenceData['ActivityCodes'].find(c => c.value === asset['activityCode']);
      asset['activityCode'] = activityCode ? this.translateService.instant(this.i18n.asset + activityCode.displayName) : 'n/a';

      if (referenceData['DepreciationConventions']) {
        const depreciationConvention = referenceData['DepreciationConventions'].find(c => c.value === asset['depreciationConvention']);
        asset['depreciationConvention'] = depreciationConvention ?
          this.translateService.instant(this.i18n.asset + depreciationConvention.displayName) : '';
      }

      if (referenceData['DepreciationMethods']) {
        const depreciationMethod = referenceData['DepreciationMethods'].find(c => c.value === asset['depreciationMethod']);
        asset['depreciationMethod'] = depreciationMethod ?
          this.translateService.instant(this.i18n.asset + depreciationMethod.displayName) : '';
      }
    });

    return assets;
  }

  public mapEnumResult(enumResultArr: EnumOptionDto[]): FieldOption[] {
    return enumResultArr.map((obj): FieldOption => {
      return { key: obj.value, displayName: obj.displayName };
    });
  }

  public updateReferenceData(data: Array<EnumOptionDto>, key: string) {
    const current = this.referenceData.getValue();
    current[key] = data;

    this.referenceData.next(current);
  }

  getSettingName(groupId: string, name = ''): string {
    return `${groupId}/${name}`;
  }

public getImportMappedColumns(groupId: string): Observable<any> {
  const s = this;
  s.settingName = s.getSettingName(groupId, 'importMappedColumns');
  return s.settingsApiService.getSettingsByGroupIdSettingType(groupId , SettingType.importMappedColumns);
}

}
