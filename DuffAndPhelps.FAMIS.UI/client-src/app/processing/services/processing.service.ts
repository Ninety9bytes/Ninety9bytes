import { Injectable } from '@angular/core';
import { ProcessingApiService } from '../../_api/_runtime/services/processing-api.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnumOptionDto } from '../../_api/_configuration/dtos/enum-option.dto';
import { AssetDto } from '../../_api/_runtime/dtos/asset.dto';
import { AssetFileSummaryDto } from '../../_api/_runtime/dtos/asset-file-summary.dto';
import { AssetSearchResponseDto } from '../../_api/_runtime/dtos/asset-search-response.dto';
import { AssetSearchDto } from '../../_api/_runtime/dtos/asset-search.dto';
import { ProcessingStatusDto } from '../../_api/_runtime/dtos/processing-status.dto';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';
import { DataTargetName } from '../../_enums/data-target-name';

@Injectable()
export class ProcessingService implements TranslatedComponent {
  i18n = TranslationBaseKeys;
  constructor(
    private inventoryApiService: InventoryApiService,
    private processingApiService: ProcessingApiService,
    private translateService: TranslationManager,
    private referenceDataApiService: ReferenceDataApiService
  ) {}

  public dataTarget: number;
  public groupId: string;

  public referenceData = new BehaviorSubject<Array<Array<EnumOptionDto>>>(new Array<Array<EnumOptionDto>>());
  private errorGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());

  public GetSearchMetadataByGroupId(groupId: string, fileType): Observable<AssetFileSummaryDto> {
    return this.inventoryApiService.getSearchMetadataByGroupId(groupId, fileType);
  }

  public searchInventory(groupId: string, searchFilter: AssetSearchDto): Observable<AssetSearchResponseDto> {
    return this.inventoryApiService.search(groupId, searchFilter);
  }

  public getProcessingStatus(groupId: string): Observable<ProcessingStatusDto> {
    return this.processingApiService.getProcessingStatus(groupId);
  }

  public addOrUpdateFilter(filterModified: FilterDto, currentFilters: Array<FilterDto>): Array<FilterDto> {
    const index = currentFilters.findIndex(d => d.id === filterModified.id);
    if (index === -1) {
      currentFilters.push(filterModified);
    } else if (index >= 0) {
      currentFilters[index] = filterModified;
    }

    return currentFilters;
  }

  public removeFilter(id: string, currentFilters: Array<FilterDto>): Array<FilterDto> {
    const index = currentFilters.findIndex(d => d.id === id);
    if (index >= 0) {
      currentFilters.splice(index, 1);
    }
    return currentFilters;
  }

  public getProcessingErrorMessage(dto: ProcessingStatusDto): string {
    // If ConsolidatedFile is created, but in preview:
    if (dto.isReadyForProcessing === false && dto.target === DataTargetName.consolidated) {
      return 'Unable to process data. Consolidated file is in preview status.';
    }

    if (dto.isReadyForProcessing === false && dto.target === DataTargetName.consolidated) {
      return 'Unable to process data. Consolidated file has not been created.';
    }

    return 'Unable to process data.';
  }

  public mapEnums(results: Array<AssetDto>): AssetDto[] {

    const referenceData = this.referenceData.getValue();

    results.forEach(result => {
      const convention = referenceData['DepreciationConvention'].find(c => c.value === result['DepreciationConvention']);
      result['DepreciationConvention'] = convention ? this.translateService.instant(this.i18n.processing + convention.displayName) : 'n/a';

      const basis = referenceData['DepreciationMethod'].find(c => c.value === result['DepreciationMethod']);
      result['DepreciationMethod'] = basis ? this.translateService.instant(this.i18n.processing + basis.displayName) : 'n/a';

      const activityCode = referenceData['ActivityCodes'].find(c => c.value === result['activityCode']);
      result['activityCode'] = activityCode ? this.translateService.instant(this.i18n.asset + activityCode.displayName) : 'n/a';
    });

    return results;
  }

  public updateReferenceData(data: Array<EnumOptionDto>, key: string) {
    const current = this.referenceData.getValue();
    current[key] = data;

    this.referenceData.next(current);
  }

  public mapTrending(results: Array<AssetDto>): AssetDto[] {

    const referenceData = this.referenceData.getValue();

    results.forEach(result => {
      result['percentChange'] = result['percentChange'] ? result['percentChange'] : 'n/a';

      const activityCode = referenceData['ActivityCodes'].find(c => c.value === result['activityCode']);
      result['activityCode'] = activityCode ? this.translateService.instant(this.i18n.asset + activityCode.displayName) : 'n/a';

    });

    return results;
  }
}
