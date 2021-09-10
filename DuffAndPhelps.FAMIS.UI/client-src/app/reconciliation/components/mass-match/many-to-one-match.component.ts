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
import { ManyToOneMatchDto } from '../../../_api/dtos/reconciliation/many-to-one-match.dto';
import { OneToManyMatchDto } from '../../../_api/dtos/reconciliation/one-to-many-match.dto';
import { MatchRecordsDto } from '../../../_api/dtos/reconciliation/match-records.dto';
import { ReconcileMatchService } from '../../services/reconcile-match.service';

@Component({
  selector: 'many-to-one-match',
  templateUrl: './many-to-one-match.component.html',

})
export class ManyToOneMatchComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  searchResponse: SearchResponseDto;
  
  @Input() selectedInventoryHeaders = new Array<GridColumnHeader>();
  @Input() selectedClientHeaders = new Array<GridColumnHeader>();
  @ViewChild(GridComponent, { static: false })
  public grid: GridComponent;

  public state: State = {
    skip: 0,
    take: 5,

    sort: <SortDescriptor[]>[
      {
        dir: 'asc',
        field: 'opportunityName'
      }
    ]
  };
  private destroyed$ = new Subject<any>();
  groupId: string;
  allInventoryHeaders = new Array<GridColumnHeader>();
  allClientHeaders = new Array<GridColumnHeader>();
  matchesCount = 0;
  selectedInventoryHeaderNames = new Array<string>() ;
  selectedClientHeaderNames = new Array<string>();
  manyMatchRecords= new Array<MatchRecordsDto>();
  matchesInProgress = new Array<ReconcilationMassMatchDto>();
  ManyToOneRecords = new Array<ManyToOneMatchDto>();
  OneToManyRecords = new Array<OneToManyMatchDto>();
  public matchedRowIndex= -1;
  selectedmatchCode: string;
  public loading: boolean;
  constructor(
    private massMatchService: MassMatchService,
    private helperService: HelperService,
    private reconcileDataService: ReconcileDataService,
    private reconcileMatchService: ReconcileMatchService,
    private router: Router,
    private alertService: AlertService,
    private element: ElementRef,
    private assetFileInfoService: AssetFileInfoService,
    private inventoryService: ReconciliationInventoryService
  ) {
   // this.loadContracts();
  }
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
      
      } //else {
      //   this.router.navigate([`project-profile/${this.groupId}/Reconciliation/mass-match`]);
      // }
    });
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.loadGridData();
  }
  ngOnDestroy() {
      this.destroyed$.next();
    }
    private loadGridData() {
      this.OneToManyRecords = orderBy(this.OneToManyRecords, this.state.sort);
      this.OneToManyRecords = process(this.OneToManyRecords, this.state);
    }
    updateManyMatchGridData(searchResponse: SearchResponseDto) {
    this.manyMatchRecords= searchResponse.matches_ManyToOne.map( m=> 
        {
        //  let ids=m.secondaryAssetRecordId;
        const record = searchResponse.records.filter(function(x){ return x.id === m.secondaryAssetRecordId; });
        const ids = m.primaryAssetRecordIds;
          return { inventoryRecords: this.assetFileInfoService.mapEnums(null, null, record),
                   clientFileRecords: this.assetFileInfoService.mapEnums(null, null,
                    searchResponse.records.filter(function(x2) { return  ids.find(f => f === x2.id); })
                   ),
                   detailRecordCount: ids.length
                  };
        });
        this.matchesCount = this.manyMatchRecords.reduce((total, cnt) => total + cnt.detailRecordCount , 0);

        this.selectedmatchCode = this.massMatchService.selectedMatchCode;
    }
  
    onMatch(dataItem: MatchRecordsDto, rowIndex: number) {

    const matchedClient = this.searchResponse.matches_ManyToOne.filter(function(x)
      { return x.secondaryAssetRecordId === dataItem.inventoryRecords.map( m => m.id)[0]; })
      .map(record =>  record);
      
      this.matchedRowIndex = this.manyMatchRecords.indexOf(dataItem);
      const matchedClientIndex = matchedClient!= null ? this.searchResponse.matches_ManyToOne.indexOf(matchedClient[0]) : -1;
      this.saveOneToOneMatches(
         matchedClient.map(x => x.primaryAssetRecordIds[rowIndex]),
         matchedClient.map(x => x.secondaryAssetRecordId),
         matchedClient.map(x => x.matchCodeId)[0],
         dataItem.detailRecordCount,
         matchedClientIndex
      );
    }
     private saveOneToOneMatches(clientAssetIds: string[], InventoryAssetIds: string[], matchCodeId: string, potentialCount:number ,matchedClientIndex: number) {
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
          this.RefreshMatchedDataGrid(potentialCount,matchedClientIndex);
          }
      });
    }
    RefreshMatchedDataGrid(potentialCount: number, matchedClientIndex: number){
      if (this.manyMatchRecords.length > 0 && this.matchedRowIndex < this.manyMatchRecords.length)
        { 
          this.manyMatchRecords.splice(this.matchedRowIndex, 1);
          this.searchResponse.matches_ManyToOne.splice(matchedClientIndex, 1);
          this.matchesCount = this.matchesCount - potentialCount;
          this.grid.collapseRow(this.matchedRowIndex);
          this.matchedRowIndex = -1;
        }
      }
}
