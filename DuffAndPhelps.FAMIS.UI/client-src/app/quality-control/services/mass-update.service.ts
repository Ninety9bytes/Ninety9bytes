import { ProcessingService } from '../../processing/services/processing.service';
import { QualityControlService } from './quality-control.service';
import { FilterOperationsService } from '../../_core/services/filter-operations.service';
import { QualityControlModes } from '../enums/quality-control-modes';
import { ReferenceDataApiService } from '../../_api/_configuration/services/reference-data-api.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MassUpdateContext } from '../../_api/_runtime/dtos/mass-update-context.dto';
import { AssetSortTermDto } from '../../_api/_runtime/dtos/asset-sort-term.dto';
import { AssetFilterTermDto } from '../../_api/_runtime/dtos/asset-filter-term.dto';
import { AssetSearchDto } from '../../_api/_runtime/dtos/asset-search.dto';
import { QualityControlApiService } from '../../_api/_runtime/services/quality-control-api.service';
import { MassUpdateRequestDto } from '../../_api/_runtime/dtos/mass-update-request.dto';
import { AssetDto } from '../../_api/_runtime/dtos/asset.dto';
import { FilterDto } from '../../_api/dtos/inventory/filter.dto';
import { FieldMetaDataDto } from '../../_api/_runtime/dtos/field-meta-data.dto';
import { QualityControlMassUpdateResponseDto } from '../../_api/_runtime/dtos/quality-control-mass-update-response.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { EnumDto } from '../../_api/_configuration/dtos/enum.dto';
import { ReplaceField } from '../../_models/replace-field-state.model';

@Injectable()
export class MassUpdateService {

    private replaceComponentState = new BehaviorSubject<ReplaceField>(<ReplaceField>{});
    public currentReplaceComponentState = this.replaceComponentState.asObservable();

    private massUpdateContextSource = new BehaviorSubject<MassUpdateContext>(<MassUpdateContext>{});
    public massUpdateContext$ = this.massUpdateContextSource.asObservable();
    public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 0, field: 'id' }];
    public defaultFilterTerms = [<AssetFilterTermDto> {
        operation: 'noop',
        term: {
            dataTarget: this.getDataTarget(),
            field: '',
            value: ''}
        }];
    private massUpdateCriteriaSearchSource = new BehaviorSubject<AssetSearchDto>(<AssetSearchDto>{
        fieldMatchTerms: [],
        fieldMatchConjunction: 'and',
        filterTerms : this.defaultFilterTerms,
        filterConjunction: 'and',
        excludeMatchedRecords: false,
        sortTerms: this.defaultSortTerms,
        skip: 0,
        take: 0
      });

    private dateFields = [
        'acquisitionDate',
        'depreciationAsOfDate',
        'lastInventoryDate',
        'updatedTimeStamp'
    ];

    constructor(
        private qualityControlApiService: QualityControlApiService,
        private qualityControlService: QualityControlService,
        private filterOperationsService: FilterOperationsService,
        private referenceDataApiService: ReferenceDataApiService
    ) {}

    public massUpdateCriteriaSearch$ = this.massUpdateCriteriaSearchSource.asObservable();

    private massUpdateRequestSource =
    new BehaviorSubject<MassUpdateRequestDto>(<MassUpdateRequestDto> {
        field: '',
        textReplaceValue: null,
        filterTerms: this.defaultFilterTerms,
        filterConjunction: 'and',
        sortTerms: this.defaultSortTerms
    });

    public massUpdateRequest$ = this.massUpdateRequestSource.asObservable();


    private resultsGridDataSource = new BehaviorSubject<Array<AssetDto>>(new Array<AssetDto>());

    public resultsGridData$ = this.resultsGridDataSource.asObservable();

    public updateReplaceComponentState(message: any) {
        this.replaceComponentState.next(message);
    }

    private getDataTarget(): number {
        const status = this.qualityControlService.status;
        if (status.exists) {
            return status.dataTarget;
        }else {
            this.qualityControlService.getStatus(this.qualityControlService.groupId).subscribe(res => {
                if (res && res.exists) {
                    return res.dataTarget;
                }
            });
        }
    }

    public updateContextSource(defaultFilterTerm: Array<FilterDto>, filterMetaData: Array<FieldMetaDataDto>): void {
        const current = this.massUpdateContextSource.getValue();
        current.defaultFilterTerm = defaultFilterTerm;
        current.filterMetaData = filterMetaData;

        this.massUpdateContextSource.next(current);
    }

    public addOrUpdateFilter(filterModified: FilterDto): void {

        // Check if the field modified is a date field which uses kendo date picker,
        // ensure the final value is a Date not a string to prevent the control from
        // throwing exception.
        if (this.isDateField(filterModified.term.field) && filterModified.term.value) {
            filterModified.term.value = new Date(filterModified.term.value);
        }


        const current = this.massUpdateCriteriaSearchSource.getValue();
        current.filterTerms = this.filterOperationsService.updateFilter
        (filterModified, current.filterTerms);
        // console.log(current.filterTerms);
        this.massUpdateCriteriaSearchSource.next(current);
    }

    public updateMassUpdateRequest(massUpdateRequest: MassUpdateRequestDto) {
        const current = this.massUpdateRequestSource.getValue();
        current.field = massUpdateRequest.field;
        current.textReplaceValue = massUpdateRequest.textReplaceValue;
        current.advancedReplaceOperation = massUpdateRequest.advancedReplaceOperation;
        this.massUpdateRequestSource.next(current);
    }

    public removeFilter(id: string): void {
        const current = this.massUpdateCriteriaSearchSource.getValue();
        current.filterTerms = this.filterOperationsService.removeFilter(id, current.filterTerms);
        this.massUpdateCriteriaSearchSource.next(current);
    }

    public setMassUpdateDataSource(data: Array<AssetDto>) {
        this.resultsGridDataSource.next(data);
    }

    public clearMassUpdateRequest(filterTerms: Array<FilterDto>) {
        const current = this.massUpdateRequestSource.getValue();
        current.field = '';
        current.textReplaceValue = null;
        current.filterTerms = filterTerms;
        current.filterConjunction = 'and';
        current.sortTerms = this.defaultSortTerms;

        this.massUpdateRequestSource.next(current);
    }

    public clearTermsForFilterCriteria() {
        const current = this.massUpdateCriteriaSearchSource.getValue();
        current.filterTerms = [];

        this.massUpdateCriteriaSearchSource.next(current);
    }

    public commitMassUpdate(mode: QualityControlModes): Observable<ApiServiceResult<QualityControlMassUpdateResponseDto>> {
        const currentMassUpdateRequest = this.massUpdateRequestSource.getValue();
        const currentCriteriaSearchRequest = this.massUpdateCriteriaSearchSource.getValue();

        currentMassUpdateRequest.field = currentMassUpdateRequest.field.charAt(0).toUpperCase() + currentMassUpdateRequest.field.slice(1);

        currentMassUpdateRequest.filterTerms = currentCriteriaSearchRequest.filterTerms;
        if (currentMassUpdateRequest.filterTerms.length === 0) {
            this.defaultFilterTerms = [<AssetFilterTermDto>{
                operation: 'noop', term: {dataTarget: this.getDataTarget(), field: '', value: ''}}];
            currentMassUpdateRequest.filterTerms = this.defaultFilterTerms;
        }

        if (mode === QualityControlModes.Content) {
            return this.qualityControlApiService.executeMassContentUpdate(this.qualityControlService.groupId, currentMassUpdateRequest);
        }

        return this.qualityControlApiService.executeMassBuildingsUpdate(this.qualityControlService.groupId, currentMassUpdateRequest);
    }

    public getActivityCodes(): Observable<ApiServiceResult<EnumDto>> {
        return this.referenceDataApiService.getActivityCodes();
      }

    private isDateField(field: string): boolean {
        return this.dateFields.indexOf(field) !== -1;
    }

}
