import { ReconcileDataService } from '../../services/reconcile-data.service';
import { FilterCriteriaBuilderComponent } from './filter-criteria-builder.component';
import { FieldMatchesComponent } from './field-matches.component';
import { MassMatchService } from '../../services/mass-match/mass-match.service';
import { AlertService } from '../../../_core/services/alert.service';
import { first } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { Router } from '@angular/router';
import { InventorySearchRepository } from '../../../_api/services/inventory/inventory-search-repository.service';
import { MatchCodesService } from '../../../_api/services/reconciliation/match-codes.service';
import { DataTargetName } from '../../../_enums/data-target-name';
import { GroupMatchCode } from '../../../_models/group-match-code.model';
import { SearchRequest } from '../../../_models/search-request.model';
import { FieldMetaDataDto } from '../../../_api/_configuration/dtos/field-metadata.dto';
import { FieldMatchDto } from '../../../_api/dtos/inventory/field-match.dto';
import { FilterDto } from '../../../_api/dtos/inventory/filter.dto';

@Component({
  selector: 'mass-match',
  templateUrl: './mass-match.component.html'
})
export class MassMatchComponent implements OnInit {
  @ViewChild('filterCriteria', { read: ViewContainerRef, static: true })
  filterCriteriaContainer: ViewContainerRef;

  @ViewChild('fieldMatch', { read: ViewContainerRef, static: true })
  fieldMatchContainer: ViewContainerRef;

  constructor(
    private reconcileDataService: ReconcileDataService,
    private router: Router,
    private searchMetadataRepository: InventorySearchRepository,
    private componentResolver: ComponentFactoryResolver,
    private massMatchService: MassMatchService,
    private searchRepositoryService: InventorySearchRepository,
    private matchCodesService: MatchCodesService,
    private alertService: AlertService
  ) {}

  dataTargetNames = DataTargetName;
  matchCodes = new Array<GroupMatchCode>();
  disabledMatchCodes = new Array<GroupMatchCode>();

  selectedGroupId: string;
  selectedMatchCodeId: string;
  isLoading = false;
  showInvalidFieldMatchesAlert = false;

  private searchInProgress = <SearchRequest>{};

  private hiddenFields = [
    'id',
    'assetFileId',
    'sourceRecordId',
    'groupId'
  ];

  ngOnInit() {

    this.selectedGroupId = this.reconcileDataService.groupId;

    if (this.selectedGroupId !== this.massMatchService.currentGroupId) {
      this.massMatchService.clearSearch();
      this.massMatchService.currentGroupId = this.selectedGroupId;
    }

    this.massMatchService.initSearchResponse(this.selectedGroupId);

    // Can only Mass Match both client file and D&P file has data.
    if (!this.massMatchService.canMassMatch) {
      // Sending user back to reconcile data step
      this.router.navigate([`project-profile/${this.selectedGroupId}/Reconciliation/reconcile-data`]);
    }

    this.searchMetadataRepository.search(DataTargetName.client, this.selectedGroupId,true).subscribe(clientDataResult => {
      this.searchMetadataRepository.search(DataTargetName.inventory, this.selectedGroupId,true).subscribe(inventoryDataResult => {
        const inventoryMetadata = new Array<Array<FieldMetaDataDto>>();

        // define list of hidden fields, filter inventoryMetadata
        const filterClientResult = clientDataResult.filter(x => !(this.hiddenFields.indexOf(x.name) > -1));

        inventoryMetadata[DataTargetName.client] = filterClientResult;
        inventoryMetadata[DataTargetName.inventory] = inventoryDataResult;

        this.massMatchService.updateInventoryMetadata(inventoryMetadata);
      });
    });

    // Init existing Field Matches and Filter Criteria
    this.massMatchService.searchRequest$.pipe(first())
    .subscribe(searchInProgress => {

      this.searchInProgress = searchInProgress;

      // Clear search in progress if new group is selected
      if (this.selectedGroupId !== searchInProgress.groupId) {
        this.massMatchService.clearSearch();
      }

      // Load one field match if no filters set
      if (searchInProgress.fieldMatchTerms.length === 0) {
        this.addFieldMatch();
      }

      // Load one filter if no filters set
      if (searchInProgress.filterTerms.length === 0) {
        this.addFilter();
      }

      // add existing field matches in progress
      searchInProgress.fieldMatchTerms.forEach(fieldMatch => {
        this.addFieldMatch(fieldMatch);
      });

      // add existing filters in progress
      searchInProgress.filterTerms.forEach(filter => {
        this.addFilter(filter);
      });

      this.selectedMatchCodeId = searchInProgress.matchCodeId;
    });

    this.matchCodesService.getGroupMatchCodes(this.selectedGroupId).subscribe(result => {
      this.matchCodes = new Array<GroupMatchCode>();
      this.disabledMatchCodes = new Array<GroupMatchCode>();
      result.forEach(code => {
        if (code.groupMatchCodeIsEnabled && code.matchCodeIsEnabled) {
          this.matchCodes.push(code);
        }
        if (code.groupMatchCodeIsEnabled && !code.matchCodeIsEnabled) {
          this.disabledMatchCodes.push(code);
        }
      });
    });
  }

  addFieldMatch(fieldMatch?: FieldMatchDto) {
    const comp = this.componentResolver.resolveComponentFactory(FieldMatchesComponent);
    const fieldMatchComponent = this.fieldMatchContainer.createComponent(comp);
    // Setting reference to close/remove
    fieldMatchComponent.instance.ref = fieldMatchComponent;
    if (fieldMatch) {
      fieldMatchComponent.instance.fieldMatch = fieldMatch;
    }
  }

  addFilter(filter?: FilterDto) {
    const comp = this.componentResolver.resolveComponentFactory(FilterCriteriaBuilderComponent);
    const filterCriteria = this.filterCriteriaContainer.createComponent(comp);
    // Setting reference to close/remove
    filterCriteria.instance.ref = filterCriteria;
    if (filter) {
      filterCriteria.instance.filter = filter;
    }
  }

  cancel(event: any) {
    event.preventDefault();
    this.massMatchService.clearSearch();
    this.router.navigate([`project-profile/${this.selectedGroupId}/Reconciliation/reconcile-data`]);
  }

  onSubmit(form: any) {
    if (form.valid) {
      const validFieldMatches = this.searchInProgress.fieldMatchTerms.filter(function(x) {
        if (x.leftTerm.field && x.rightTerm.field) {
          return x;
        }
      });

      // Field Matches must be set on both the Client File and Actual Inventory
      if (validFieldMatches.length === 0 || validFieldMatches.length < this.searchInProgress.fieldMatchTerms.length) {
        this.showInvalidFieldMatchesAlert = true;
      } else {
        this.showInvalidFieldMatchesAlert = false;

        this.isLoading = true;

        this.massMatchService.searchAssets(this.selectedGroupId, this.selectedMatchCodeId).subscribe(result => {
          if (result) {
            this.isLoading = false;
           const matchCode= this.matchCodes.filter(f=>f.matchCodeId===this.selectedMatchCodeId).map(m=>m.matchCodeName);
           this.massMatchService.selectedMatchCode = matchCode ? matchCode[0] : null;
            this.massMatchService.updateSearchResponse(result);

            this.router.navigate([`/project-profile/${this.selectedGroupId}/Reconciliation/view-matches`]);
          }
        },
        error => {
          if (error['error'] && error['error'].includes('many to many')) {
            this.alertService
            .error('manytomany');
          } else {
            this.alertService.error('An error has occurred');
          }
          this.isLoading = false;
        });
      }
    }
  }
}
