import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, Input  } from '@angular/core';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import {  orderBy, process } from '@progress/kendo-data-query/dist/es/main';
import { SearchResponseDto, SearchRecordDto } from '../../../_api/dtos/inventory/search-response.dto';
import { ReconcilationMassMatchDto } from '../../../_api/dtos/reconcilation-mass-match.dto';
import { DataTargetName } from '../../../_enums/data-target-name';
import { GridComponent, SelectionEvent, RowClassArgs, GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { DataType } from '../../../_models/data-type';
import { GridColumnHeader } from '../../../_models/grid-column-header.model';
import { MassMatchService } from '../../services/mass-match/mass-match.service';
import { HelperService } from '../../../_core/services/helper.service';
import { AlertService } from '../../../_core/services/alert.service';
import { ReconcileDataService } from '../../services/reconcile-data.service';
import { AssetFileInfoService } from '../../../_core/services/asset-file-info-service';
import { ReconciliationInventoryService } from '../../services/inventory.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MassMatchGridState } from '../../../_models/mass-match-grid-state';
//import { ManyMatchDetailComponent } from './many-match-detail.component';
import { ManyToOneMatchDto } from '../../../_api/dtos/reconciliation/many-to-one-match.dto';
import { OneToManyMatchDto } from '../../../_api/dtos/reconciliation/one-to-many-match.dto';
import { MatchRecordsDto } from '../../../_api/dtos/reconciliation/match-records.dto';
import { ReconcileMatchService } from '../../services/reconcile-match.service';
import { MatchCodesService } from '../../../_api/services/reconciliation/match-codes.service';
//import { ManyMatchRecordDto } from '../../../_api/dtos/reconciliation/many-match-record.dto';
//import { ManyMatchRecordDto } from '../../../_api/dtos/reconciliation/many-match-record.dto';


@Component({
  selector: 'one-to-many-match',
  templateUrl: './one-to-many-match.component.html',
})
export class OneToManyMatchComponent implements OnInit, AfterViewInit, OnDestroy, TranslatedComponent {
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

  selectedInventoryHeaderNames = new Array<string>() ;
  selectedClientHeaderNames = new Array<string>();

  selectedClientFileRows = new Array<string>();
  selectedInventoryFileRows = new Array<string>();

  matchesCount = 0;
  clientFileRecords = new Array<SearchRecordDto>();

  saveIsLoading = false;
  saveAndNewIsLoading = false;

  groupId: string;

 manyMatchRecords= new Array<MatchRecordsDto>();

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
  public gridState: MassMatchGridState = {
    skip: 0,
    take: 250
  };
  public sort: Array<SortDescriptor> = [];
  public pageSize = 10;
  public skip = 0;
  
  private destroyed$ = new Subject<any>();

  @Input() selectedInventoryHeaders = new Array<GridColumnHeader>();
  @Input() selectedClientHeaders = new Array<GridColumnHeader>();
  //@ViewChild('manyMatchDetail', {static: false})
  //private manyMatchDetail: ManyMatchDetailComponent;
  public loading: boolean;
  @ViewChild(GridComponent, { static: false })
   public grid: GridComponent;

   ManyToOneRecords = new Array<ManyToOneMatchDto>();
   OneToManyRecords = new Array<OneToManyMatchDto>();
   public expandedDetailKeys: any[] = [];
   matchCodeId: string;
   public matchedRowIndex= -1;

  selectedmatchCode: string;
  constructor(
    private massMatchService: MassMatchService,
    private helperService: HelperService,
    private reconcileDataService: ReconcileDataService,
    private reconcileMatchService: ReconcileMatchService,
    private router: Router,
    private alertService: AlertService,
    private element: ElementRef,
    private assetFileInfoService: AssetFileInfoService,
    private inventoryService: ReconciliationInventoryService,
    private matchCodesService: MatchCodesService,
  ) { }

  ngOnInit() {
    this.groupId = this.reconcileDataService.groupId;
  const s = this;
  
    this.massMatchService.searchResponse$.subscribe(searchResponse => {
      if (searchResponse) {
        this.searchResponse = searchResponse;
       
          if (s.searchResponse.records && s.searchResponse.matches) {
            s.matchesInProgress = Array.from(s.searchResponse.matches);
            s.matchesCount = s.matchesInProgress.length;

            this.updateManyMatchGridData(s.searchResponse);
          
          }
       // });
         // error => {},
         // () => {};
      } else {
        this.router.navigate([`project-profile/${this.groupId}/Reconciliation/mass-match`]);
      }
    });
  }

  ngAfterViewInit(): void {
    // this.syncScrolling(
    //   this.clientFileMatchesGrid.nativeElement.getElementsByClassName('k-grid-content')[0],
    //   this.inventoryMatchesGrid.nativeElement.getElementsByClassName('k-grid-content')[0]
    // );
  }

public dataStateChange(state: DataStateChangeEvent): void {
  this.state = state;
  this.loadGridData();
}

  ngOnDestroy() {
    this.destroyed$.next();
  }
  private loadGridData() {
  
    this.manyMatchRecords = orderBy(this.manyMatchRecords.map(m => m.inventoryRecords), this.state.sort);
   // this.manyMatchRecords.sort()
    //this.manyMatchRecords = process(this.manyMatchRecords, this.state);
  }
  updateManyMatchGridData(searchResponse: SearchResponseDto) {
  this.manyMatchRecords= searchResponse.matches_OneToMany.map( m=> 
      {
      const c_record = searchResponse.records.filter(function(x){ return x.id === m.primaryAssetRecordId; });
      const ids = m.secondaryAssetRecordIds;
        return { clientFileRecords: this.assetFileInfoService.mapEnums(null, null, 
          c_record
          ),
                 inventoryRecords: this.assetFileInfoService.mapEnums(null, null,
                  searchResponse.records.filter(function(x2) { return  ids.find(f => f === x2.id); })
                 ),
                 detailRecordCount: ids.length
                };
      });
      this.matchesCount = this.manyMatchRecords.reduce((total, cnt) => total + cnt.detailRecordCount , 0);

     this.selectedmatchCode = this.massMatchService.selectedMatchCode;
  }
  public showOnlyDetails(dataItem: any, primarId: string, index: number): boolean {
    return dataItem.inventoryRecords !== null;
 }
 public expandDetailsBy = (dataItem: any): any  => {
  return dataItem.clientFileRecords.Id;
}
getMatchCode(id:string)
  {
     this.matchCodesService.getMatchCodeById(id).subscribe(res=>{
      this.selectedmatchCode = res.name;
     });
  }
  onMatch(dataItem: MatchRecordsDto, rowIndex: number) {

    //const invId= dataItem.inventoryRecords[rowIndex].id;

    const matchedClient = this.searchResponse.matches_OneToMany.filter(function(x)
    { return x.primaryAssetRecordId === dataItem.clientFileRecords.map( m => m.id)[0]; })
    .map(record =>  record);
    const matchedClientIndex = matchedClient!= null ? this.searchResponse.matches_OneToMany.indexOf(matchedClient[0]) : -1;
    
    this.matchedRowIndex = this.manyMatchRecords.indexOf(dataItem);
    this.saveOneToOneMatches(
       matchedClient.map(x => x.primaryAssetRecordId),
       matchedClient.map(x => x.secondaryAssetRecordIds[rowIndex]), //secondaryAssetRecordId,
       matchedClient.map(x => x.matchCodeId)[0],
       dataItem.detailRecordCount,
       matchedClientIndex
    );
  }
   private saveOneToOneMatches(
     clientAssetIds: string[], InventoryAssetIds: string[], matchCodeId: string, potentialCount:number, matchedClientIndex: number) {
    this.reconcileMatchService.createMassOneToOneMatch(clientAssetIds, InventoryAssetIds, matchCodeId).subscribe(dto => {
      if (dto == null) {
        this.alertService.error('Unexpected service error.');
      }
      if (dto.result == null) {
        this.alertService.error('Unexpected error saving match.');
      }
      if (dto.invalidArguments.length > 0) {
        this.alertService.error('The selected items cannot be saved as a mass one to one match.');
      }

      if(dto.result != null && dto.invalidArguments.length == 0){
      
      this.alertService.success('Match saved successfully!');
      this.RefreshMatchedDataGrid(potentialCount, matchedClientIndex);
      }
    });
  }
  
  RefreshMatchedDataGrid(potentialCount: number, matchedClientIndex:number){
    if(this.manyMatchRecords.length > 0 && this.matchedRowIndex < this.manyMatchRecords.length)
    { 
      this.manyMatchRecords.splice(this.matchedRowIndex, 1);
      this.searchResponse.matches_OneToMany.splice(matchedClientIndex, 1);
      this.matchesCount = this.matchesCount - potentialCount;
      this.grid.collapseRow(this.matchedRowIndex);
      this.matchedRowIndex = -1;
    }
  }
    
  onSubmit(form: any) {
    if (form.valid) {
    this.saveIsLoading = true;
    this.saveIsLoading = true;
    
    }
  }
  public sortChangeClient(sort: SortDescriptor[]): void {
    //this.sort = sort;
    if (sort && sort.length > 0 && sort[0].field !== 'Actions') {
      this.gridState.sortTerm = sort[0].dir ? {
        field: sort[0].field,
        sortDirection: sort[0].dir === 'asc' ? 0 : 1,
        termOrder: 0
      } : undefined;

      this.gridState.skip = 0;
      // this.clientFileRecords = [];
      // this.inventoryRecords = [];

      this.refreshGridData();
      //this.loadGridData();
      this.state.sort = sort;
      this.stateInventory.sort = sort;
    }
  }
  public  refreshGridData() {
    if (this.gridState.skip >= this.matchesCount) {
      return;
    }

    this.loading = true;
    this.massMatchService.searchAssets(this.groupId, this.matchesInProgress[0].matchCodeId, this.gridState).subscribe((searchResponse) => {
      this.loading = false;
      if (searchResponse && searchResponse.records && searchResponse.matches) {
        this.updateManyMatchGridData(searchResponse);
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
}
