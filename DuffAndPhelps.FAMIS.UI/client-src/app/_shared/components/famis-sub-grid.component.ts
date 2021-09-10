import { process, State } from '@progress/kendo-data-query';
import { GridSubGridData } from '../../_models/shared/famis-sub-grid.model';
import { HelperService } from '../../_core/services/helper.service';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { Component, Input, OnInit } from '@angular/core';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';


@Component({
  selector: 'famis-sub-grid',
  templateUrl: './famis-sub-grid.component.html'
})
export class FamisSubGridComponent implements OnInit {
  @Input() data: GridSubGridData;
  @Input() dataItem: any;
  @Input() translationBaseKey: string;

  public columns: Array<GridColumnHeader>;
  public subGridSortedData: any;
  public gridDataResult: GridDataResult;
  public state: State = {
    skip: 0,
    take: 8,

    filter: {
      logic: 'and',
      filters: []
    }
  };

  constructor(
    private helperService: HelperService
  ) {}

  ngOnInit() {
    this.subGridSortedData = this.data.subGridData.filter((dataObj) => {
      for (const prop in dataObj) {
        if (dataObj[prop] === this.dataItem.id) {
          return dataObj;
        }
      }
    });
    this.columns = this.data.subGridHeaders;
    this.loadItems();
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.loadItems();
  }

  private loadItems() {
    this.gridDataResult = process(this.subGridSortedData, this.state);
  }

  public getColumnTitle(column: GridColumnHeader): string {
    return this.helperService.getColumnTitle(this.translationBaseKey, column);
  }
}
