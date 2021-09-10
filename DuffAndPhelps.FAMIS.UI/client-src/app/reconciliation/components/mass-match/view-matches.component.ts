import { MassMatchService } from '../../services/mass-match/mass-match.service';
import { HelperService } from '../../../_core/services/helper.service';
import { AlertService } from '../../../_core/services/alert.service';
import { GridComponent, SelectionEvent, RowClassArgs, GridDataResult } from '@progress/kendo-angular-grid';
import { AfterViewInit, Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ReconcileDataService } from '../../services/reconcile-data.service';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { ReconciliationInventoryService } from '../../services/inventory.service';
import { TranslateCompiler } from '@ngx-translate/core';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { FamisGridUpdateColumnSelectionEvent } from '../../../_models/shared/famis-grid-update-column-selection-event.model';
import { takeUntil } from 'rxjs/operators';
import { SearchResponseDto, SearchRecordDto } from '../../../_api/dtos/inventory/search-response.dto';
import { ReconcilationMassMatchDto } from '../../../_api/dtos/reconcilation-mass-match.dto';
import { DataTargetName } from '../../../_enums/data-target-name';
import { DataType } from '../../../_models/data-type';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { Subject, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { MassMatchGridState } from '../../../_models/mass-match-grid-state';
import { MatchCodesService } from '../../../_api/services/reconciliation/match-codes.service';
@Component({
  selector: 'view-matches',
  templateUrl: './view-matches.component.html'
})
export class ViewMatchesComponent implements OnInit, AfterViewInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  searchResponse: SearchResponseDto;
  clientFileMatches = new Array<ReconcilationMassMatchDto>();
  dataTargetNames = DataTargetName;
  public clientGridViewData: GridDataResult;
  public inventoryGridViewData: GridDataResult;
  dataType = DataType;

  matchesInProgress = new Array<ReconcilationMassMatchDto>();
  inventoryRecords = new Array<SearchRecordDto>();

  allInventoryHeaders = new Array<GridColumnHeader>();
  allClientHeaders = new Array<GridColumnHeader>();

  selectedInventoryHeaders = new Array<GridColumnHeader>();
  selectedClientHeaders = new Array<GridColumnHeader>();

  selectedInventoryHeaderNames = new Array<string>() ;
  selectedClientHeaderNames = new Array<string>();

  selectedClientFileRows = new Array<string>();
  selectedInventoryFileRows = new Array<string>();

  matchesCount = 0;
  clientFileRecords = new Array<SearchRecordDto>();

  saveIsLoading = false;
  saveAndNewIsLoading = false;

  groupId: string;

  public state: State = {
    skip: 0,
    take: 15,

    sort: <SortDescriptor[]>[
      {
        dir: 'asc',
        field: 'description'
      }
    ]
  };
  public stateInventory: State /*StateForInventory*/ = {
    skip: 0,
    take: 15,

    sort: <SortDescriptor[]>[
      {
        dir: 'asc',
        field: 'description'
      }
    ]
  };
  @ViewChild('clientFileMatchesGrid', { read: ElementRef, static: false })
  clientFileMatchesGrid: ElementRef;
  @ViewChild('inventoryMatchesGrid', { read: ElementRef, static: false })
  inventoryMatchesGrid: ElementRef;
  /* A Subject for monitoring the destruction of the component. */
  private destroyed$ = new Subject<any>();

  public selectableSettings = {
    checkboxOnly: true
  };

  public loading: boolean;

  public gridState: MassMatchGridState = {
    skip: 0,
    take: 250
  };
  selectedmatchCode: string;
 
  constructor(
    private massMatchService: MassMatchService,
    private helperService: HelperService,
    private reconcileDataService: ReconcileDataService,
    private router: Router,
    private alertService: AlertService,
    private element: ElementRef,
    private assetFileInfoService: AssetFileInfoService,
    private inventoryService: ReconciliationInventoryService,
    private matchCodesService: MatchCodesService,
  ) {}

  // TODO: Break this out into service methods within MassMatchService
  ngOnInit() {
    const s = this;

    this.groupId = this.reconcileDataService.groupId;
    
    // Init form fields
    const getInventoryMetadata = this.inventoryService.getSearchMetadataByGroupId(this.groupId, DataTargetName.inventory);
    const getClientMetadata = this.inventoryService.getSearchMetadataByGroupId(this.groupId, DataTargetName.client);
    const getActivityCodes = this.massMatchService.getActivityCodes();
   const getMatcheCodes = this.matchCodesService.getMatchCodes();
    this.massMatchService.searchResponse$.subscribe(searchResponse => {
      if (searchResponse) {
        this.searchResponse = searchResponse;

        forkJoin(getInventoryMetadata, getClientMetadata, getActivityCodes, getMatcheCodes)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(([inventoryMetadata, clientMetadata, activityCodes, matcheCodes]) => {
          this.assetFileInfoService.updateReferenceData(activityCodes.result.enumOptions, 'ActivityCodes');

          if (s.searchResponse.records && s.searchResponse.matches) {
            s.matchesInProgress = Array.from(s.searchResponse.matches);
            s.matchesCount = s.matchesInProgress.length;

            this.updateGridData(s.searchResponse);
            //this.updateManyMatchGridData(s.searchResponse);
            this.gridState.skip = this.gridState.take;

            s.allInventoryHeaders = this.helperService.mapHeaders(
              inventoryMetadata.fields,
              this.assetFileInfoService.GetInternalColumns()
            );

            s.allClientHeaders = this.helperService.mapHeaders(clientMetadata.fields, this.assetFileInfoService.GetInternalColumns());

            const selectedInventoryHeaderNames = this.massMatchService.searchFieldMatchTerms
              .map(c => c.rightTerm.field)
              .concat(
                this.massMatchService.searchFilterTerms
                  .filter(c => c.term.dataTarget === DataTargetName.inventory)
                  .map(c => c.term.field)
              )
              .filter(s.distinctValues);
              if (selectedInventoryHeaderNames.findIndex(c => c === 'description') === -1) {
                selectedInventoryHeaderNames.push('description');
              }
            this.massMatchService.updateSelectedInventoryHeaders(selectedInventoryHeaderNames);

            const selectedClientHeaderNames = this.massMatchService.searchFieldMatchTerms
              .map(c => c.leftTerm.field)
              .concat(
                this.massMatchService.searchFilterTerms
                  .filter(c => c.term.dataTarget === DataTargetName.client)
                  .map(c => c.term.field)
              )
              .filter(s.distinctValues);
              if (selectedClientHeaderNames.findIndex(c => c === 'description') === -1) {
                selectedClientHeaderNames.push('description');
              }
            this.massMatchService.updateSelectedClientHeaders(selectedClientHeaderNames);
          }
        });
         // error => {},
         // () => {};
      } else {
        // No search response
        // Sending user back mass match
        this.router.navigate([`project-profile/${this.groupId}/Reconciliation/mass-match`]);
      }
    });

    this.massMatchService.selectedClientHeaders$.subscribe(selectedHeaders => {
      if (selectedHeaders) {
        this.selectedClientHeaders = this.allClientHeaders.filter(function(x) {
          return selectedHeaders.find(c => c === x.name);
        });

        this.selectedClientHeaderNames = this.selectedClientHeaders.map(c => c.name);
      }
    });

    this.massMatchService.selectedInventoryHeaders$.subscribe(selectedHeaders => {
      if (selectedHeaders) {
        this.selectedInventoryHeaders = this.allInventoryHeaders.filter(function(x) {
          return selectedHeaders.find(c => c === x.name);
        });

        this.selectedInventoryHeaderNames = this.selectedInventoryHeaders.map(c => c.name);
      }
    });

  }

  ngAfterViewInit(): void {
    this.syncScrolling(
      this.clientFileMatchesGrid.nativeElement.getElementsByClassName('k-grid-content')[0],
      this.inventoryMatchesGrid.nativeElement.getElementsByClassName('k-grid-content')[0]
    );
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }

  private syncSort(sort: SortDescriptor[]) {
    if (sort && sort.length > 0 && sort[0].field !== 'Actions') {
      this.gridState.sortTerm = sort[0].dir ? {
        field: sort[0].field,
        sortDirection: sort[0].dir === 'asc' ? 0 : 1,
        termOrder: 0
      } : undefined;

      this.gridState.skip = 0;
      this.clientFileRecords = [];
      this.inventoryRecords = [];

      this.refreshGridData();

      this.state.sort = sort;
      this.stateInventory.sort = sort;
    }
  }

  public sortChangeClient(sort: SortDescriptor[]): void {
    this.syncSort(sort);
  }
  public sortChangeInventroyRecords(sort: SortDescriptor[]): void {
    this.syncSort(sort);
  }

  private loadClientMatchData() {
    this.clientFileRecords = orderBy(this.clientFileRecords, this.state.sort);
    // this.contracts = orderBy(this.contracts, this.state.sort);
    this.clientGridViewData = process(this.clientFileRecords, this.state);
  }

  private loadInventoryMatchData() {
    this.inventoryRecords = orderBy(this.inventoryRecords, this.stateInventory.sort);
    // this.contracts = orderBy(this.contracts, this.state.sort);
    this.inventoryGridViewData = process(this.inventoryRecords, this.stateInventory);
  }

  unmatch(assetId: string) {
    const match = this.matchesInProgress.find(c => c.primaryAssetRecordId === assetId || c.secondaryAssetRecordId === assetId);
    const matchIndex = this.matchesInProgress.indexOf(match);

    const primaryIndex = this.inventoryRecords.findIndex(c => c.id === match.secondaryAssetRecordId);
    const secondaryIndex = this.clientFileRecords.findIndex(c => c.id === match.primaryAssetRecordId);

    if (matchIndex >= 0) {
      this.matchesInProgress.splice(matchIndex, 1);

      this.matchesCount = this.matchesCount - 1;

      this.inventoryRecords[primaryIndex].isUnmatched = true;
      this.clientFileRecords[primaryIndex].isUnmatched = true;

      setTimeout(() => {
        if (primaryIndex >= 0 && secondaryIndex >= 0) {
          this.inventoryRecords.splice(primaryIndex, 1);
          this.clientFileRecords.splice(secondaryIndex, 1);
        }
      }, 250);
    }
  }

  public isUnmatched(context: RowClassArgs) {
    return context.dataItem.isUnmatched ? 'un-matched animated fadeOutLeft' : 'mass-match-row';
  }
 RefreshMatchedDataGrid(){
  this.matchesInProgress.forEach((element, index) => {
    const primaryIndex = this.inventoryRecords.findIndex(c => c.id === element.secondaryAssetRecordId);
    const secondaryIndex = this.clientFileRecords.findIndex(c => c.id === element.primaryAssetRecordId);
   if (primaryIndex >= 0 && secondaryIndex >= 0) {
         this.inventoryRecords.splice(primaryIndex, 1);
         this.clientFileRecords.splice(secondaryIndex, 1);
         this.matchesInProgress.splice(index, 1);
         this.matchesCount = this.matchesCount - 1;
       }
  }); 
  this.loadClientMatchData();
  this.loadInventoryMatchData();

  }
  onSubmit() {
    if(this.matchesInProgress != null && this.matchesInProgress.length > 0){
    this.saveIsLoading = true;

    this.massMatchService.saveMassMatch(this.matchesInProgress).subscribe(result => {
      if (result) {
        this.saveIsLoading = false;
        this.alertService.success(`{{matchesInProgress}} matches saved successfully!`,
         null, {matchesInProgress: this.matchesInProgress.length});
        //this.router.navigate([`project-profile/${this.groupId}/Reconciliation/reconcile-data`]);
        this.RefreshMatchedDataGrid();
      }
    });
    }
  }

  saveAndNew(event: any) {
    event.preventDefault();
    if(this.matchesInProgress != null && this.matchesInProgress.length > 0){
        this.saveAndNewIsLoading = true;
        this.massMatchService.saveMassMatch(this.matchesInProgress).subscribe(result => {
          if (result) {
            this.saveAndNewIsLoading = false;

            this.alertService.success(`${this.matchesInProgress.length} matches saved successfully!`);

            this.massMatchService.clearSearch();

            this.router.navigate([`project-profile/${this.groupId}/Reconciliation/mass-match`]);
          }
        });
      }
  }

  back(event: any) {
    this.router.navigate([`project-profile/${this.groupId}/Reconciliation/mass-match`]);
  }

  public clientFileSelectionChange(event: SelectionEvent) {

    this.selectedInventoryFileRows = new Array<string>();

    event.selectedRows.forEach(row => {
      if (row.dataItem && row.dataItem.id) {
        const filteredMatches = this.searchResponse.matches
          .filter(c => c.primaryAssetRecordId === row.dataItem.id)
          .map(c => c.secondaryAssetRecordId);

        this.selectedInventoryFileRows = filteredMatches;
      }
    });
  }

  public inventoryFileSelectionChange(event: SelectionEvent) {

    this.selectedClientFileRows = new Array<string>();

    event.selectedRows.forEach(row => {
      if (row.dataItem && row.dataItem.id) {
        const filteredMatches = this.searchResponse.matches
          .filter(c => c.secondaryAssetRecordId === row.dataItem.id)
          .map(c => c.primaryAssetRecordId);

        this.selectedClientFileRows = filteredMatches;
      }
    });
  }

  public onColumnSelection(columnsSelected: FamisGridUpdateColumnSelectionEvent) {
    this.massMatchService.updateSelectedInventoryHeaders(columnsSelected.SelectedHeaders);
    this.massMatchService.updateSelectedClientHeaders(columnsSelected.SelectedHeaders);

  }

  private distinctValues(value, index, self) {
    return self.indexOf(value) === index;
  }

  private syncScrolling(one, two) {
    function sync(source) {
      setTimeout(() => {
        this.scrollTop = source.scrollTop;
        this.scrollLeft = source.scrollLeft;
      }, 10);
    }
    two.onscroll = sync.bind(one, two);
  }

  public  refreshGridData() {
    if (this.gridState.skip >= this.matchesCount) {
      return;
    }

    this.loading = true;
    this.massMatchService.searchAssets(this.groupId, this.matchesInProgress[0].matchCodeId, this.gridState).subscribe((searchResponse) => {
      this.loading = false;
      if (searchResponse && searchResponse.records && searchResponse.matches) {
        this.updateGridData(searchResponse);
        this.gridState.skip += this.gridState.take;
      }
    }, (error) => {
      if (error['error'] && error['error'].includes('many to many')) {
        this.alertService
        .error('manytomany');
      } else {
        this.alertService.error('An error has occurred');
      }
      this.loading = false;
    });
  }

  updateGridData(searchResponse: SearchResponseDto) {
    this.inventoryRecords = this.inventoryRecords.concat(this.assetFileInfoService.mapEnums(null, null,
      searchResponse.records.filter(function(x) {
        return searchResponse.matches.find(c => c.secondaryAssetRecordId === x.id);
      }).map(record => {
        return record;
      })));
    this.clientFileRecords = this.clientFileRecords.concat(this.assetFileInfoService.mapEnums(null, null,
      searchResponse.records.filter(function(x) {
        return searchResponse.matches.find(c => c.primaryAssetRecordId === x.id);
      }).map(record => {
        return record;
      })));
  } 

}
