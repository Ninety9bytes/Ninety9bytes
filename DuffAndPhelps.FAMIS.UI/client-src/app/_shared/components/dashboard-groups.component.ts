import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { Component, Input, OnInit } from '@angular/core';
import { ContractsGroupSummaryDto } from '../../_api/dtos/shared/contracts-groups-summary.dto';
import { GridDataResult, DataStateChangeEvent } from '@progress/kendo-angular-grid';
import { ContractService } from '../../_api/services/dashboard/contract.service';
import { Router } from '@angular/router';
import { DataTargetName } from '../../_enums/data-target-name';

@Component({
  selector: 'dashboard-groups',
  templateUrl: './dashboard-groups.component.html'
})
export class DashboardGroupsComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input()
  id: string;
  public groups: ContractsGroupSummaryDto[] = new Array<ContractsGroupSummaryDto>();
  public gridViewData: GridDataResult;
  public groupsGridBusy = true;
  public height: number;
  private rowHeight = 80;
  public state: State = {
    skip: 0,
    take: 15,

    // Initial filter descriptor
    filter: {
      logic: 'and',
      filters: []
    }
  };

  constructor(
    private contractRepositoryService: ContractService,
    private router: Router
  ) {}

  ngOnInit() {

    if (this.id) {
      this.contractRepositoryService.getContractsGroups(this.id).subscribe(
        result => {
          this.groups = result;
          this.loadGroups();
          this.groupsGridBusy = false;
        },
        error => {},
        () => (this.groupsGridBusy = false)
      );
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.loadGroups();
  }

  public getTypeName(type: number) {
    if (type === DataTargetName.client) {
      return 'Client';
    }

    if (type === DataTargetName.inventory) {
      return 'Inventory';
    }

    if (type === DataTargetName.consolidated) {
      return 'Consolidated';
    }

    if (type === DataTargetName.building) {
      return 'Buildings';
    }

    return 'Unknown Source';
  }

  public navigateToProject(id: string, event: any) {
    event.preventDefault();
    this.router.navigate([`/project-profile/${id}/MainProfile`]);
  }

  private loadGroups() {
    this.gridViewData = process(this.groups, this.state);
    this.height = this.calculateDynamicHeight(this.groups.length);
  }

  private calculateDynamicHeight(totalGroups: number): number {
    const c = this;
    const baseHeight = (2 * c.rowHeight);
    if (totalGroups >= this.state.take) {
      return baseHeight * (this.state.take / 2);
    } else {
      return baseHeight * totalGroups;
    }
  }
}
