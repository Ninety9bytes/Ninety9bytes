import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { RowClassArgs, SelectionEvent, GridDataResult, PageChangeEvent, DataStateChangeEvent,
  SelectableSettings } from '@progress/kendo-angular-grid';
import { AlertService } from '../../_core/services/alert.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Observable, pipe } from 'rxjs';
import { MetadataDto } from '../../_api/_runtime/dtos/reporting/report-metadata.dto';
import { ReportsService } from '../../reports/services/reports.service';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import {map, tap} from 'rxjs/operators';



@Component({
  selector: 'setup-metadata',
  templateUrl: './setup-metadata.component.html'
})

export class SetupMetadataComponent implements OnInit, TranslatedComponent, OnChanges {
  i18n = TranslationBaseKeys;
  metadataGridBusy = true;

  @Input() group: GroupDto;
  selectedMetadataIds: Array<any>;
  metadata$: Observable<MetadataDto[]>;
  metadata: MetadataDto[] = new Array<MetadataDto>();

  public selectableSettings = <SelectableSettings> {
    checkboxOnly: true,
    mode: 'multiple'
  };

  state: State = {
   sort: <SortDescriptor[]>[{
      dir: 'asc',
      field: 'tagName'
    }]

  };

  public sortSelectedAsc = false;
  public sortSelectedDesc = false;

  gridData: GridDataResult = process(this.metadata, this.state);
  //gridData : any[]

  constructor(private reportsService: ReportsService, private alertService: AlertService) { }

  dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridData = process(this.metadata, this.state);
  }

  ngOnInit() {
   this.reportsService.getReportMetadata(this.group.id).subscribe(
      data => {
        this.metadata = data; 
        this.gridData = process(this.metadata, this.state);
      },
      error => {},
      () => this.metadataGridBusy = false);

      this.reportsService.getGropuMetadataByGroupId(this.group.id)
      .subscribe(data => {
        if (data != null) {
          console.log(data);
          data.forEach(groupMetadata => {
             this.selectedMetadataIds.push(groupMetadata.metadataId);
            });
        }
      });

   if (!this.selectedMetadataIds) {
     this.selectedMetadataIds = new Array<any>();
   }
  }

  ngOnChanges()
  {
    this.refreshGroupMetadata();
  }
  private refreshGroupMetadata(){
    this.selectedMetadataIds = new Array<any>();
    this.reportsService.getGropuMetadataByGroupId(this.group.id)
      .subscribe(data => {
        if (data != null) {
          data.forEach(groupMetadata => {
             this.selectedMetadataIds.push(groupMetadata.metadataId);
            });
        }
      });
  }
  onSelectionChanged(args?: SelectionEvent) {
    setTimeout(() => {
      this.onDeselectedRows(args.deselectedRows);
      if (args.selectedRows != null && args.selectedRows.length > 0) {
        this.UpdateSelectedRows(args.selectedRows);
      }
    
    });
  }

  private onDeselectedRows(deselectedRows: Array<any>){
    if (deselectedRows == null || deselectedRows.length === 0) {
      return;
    }
    const deselectedMetadata = new Array<MetadataDto>();
    deselectedRows.forEach(value => {
      const metadataa = this.metadata.find(c => c.id === value.dataItem.id);
      deselectedMetadata.push(metadataa);
    });
    this.reportsService.deleteGroupMetadata(this.group.id,deselectedMetadata);
    
  }

  private validateSelectedRows(selectedRows: Array<any>) {
    selectedRows.forEach(value => {
      const metadata = this.metadata.find(c => c.id === value.dataItem.id);
    });
  }

  private UpdateSelectedRows(selectedRows: Array<any>) {
    const selectedMetadata = new Array<MetadataDto>();
    selectedRows.forEach(value => {
      const metadataa = this.metadata.find(c => c.id === value.dataItem.id);
     selectedMetadata.push(metadataa);
    });
    this.reportsService.createGroupMetadata(this.group.id,selectedMetadata);

}

}

