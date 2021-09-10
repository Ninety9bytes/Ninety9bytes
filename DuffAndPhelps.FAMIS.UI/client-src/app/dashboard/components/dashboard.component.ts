import { ContractSummaryService } from '../services/contract-summary.service';
import { ContractSummary } from '../../_models/contract-summary.model';
import { GridDataResult, DataStateChangeEvent, ColumnReorderEvent, GridComponent } from '@progress/kendo-angular-grid';
import { SortDescriptor, orderBy, State, process } from '@progress/kendo-data-query/dist/es/main';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { UserGridService } from '../../_core/services/user-grid.service';
import { UserStore } from '../../_core/user/user.store';
import { HelperService } from '../../_core/services/helper.service';
import { AlertService } from '../../_core/services/alert.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GridColumnHeader } from '../../_models/grid-column-header.model';
import { Router, ActivatedRoute } from '@angular/router';
import { CompositeFilterDescriptor } from '@progress/kendo-data-query';

 @Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public contracts: Array<ContractSummary> = [];
  public gridViewData: GridDataResult;
  public dashboardGridBusy = true;

  public userId: string;
  public gridSettingsName: string;

   @ViewChild(GridComponent, { static: false })
  public grid: GridComponent;

  public state: State = {
    skip: 0,
    take: 15,

    sort: <SortDescriptor[]>[
      {
        dir: 'asc',
        field: 'opportunityName'
      }
    ]
  };

  public defaultDashboardHeaders = [
    <GridColumnHeader>{ name: 'client', displayName: 'Account Description', order: 0 },
    <GridColumnHeader>{ name: 'opportunityName', displayName: 'Opportunity Name', order: 1 },
    <GridColumnHeader>{ name: 'office', displayName: 'Office', order: 2 },
    <GridColumnHeader>{ name: 'country', displayName: 'Country', order: 3 },
    <GridColumnHeader>{ name: 'industry', displayName: 'Industry', order: 4 },
    <GridColumnHeader>{ name: 'projectCode', displayName: 'Project Code', order: 5 },
    <GridColumnHeader>{ name: 'service', displayName: 'Service', order: 6 },
    <GridColumnHeader>{ name: 'billingDirector', displayName: 'Billing Director', order: 7 },
    <GridColumnHeader>{ name: 'performingMd', displayName: 'Performing MD', order: 8 },
    <GridColumnHeader>{ name: 'createdFromSalesforce', displayName: 'Created From Salesforce', order: 9 }
  ];

  public headers = new Array<GridColumnHeader>();
  public defaultFilterSet = false;

  // public gridData: GridDataResult = process(this.contracts, this.state);
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private contractService: ContractSummaryService,
    private userGridService: UserGridService,
    private userStore: UserStore,
    private helperService: HelperService,
    private alertService: AlertService
  ) {
    this.loadContracts();
  }

  ngOnInit() {

    this.userStore.user.subscribe(user => {
      this.userId = user.profile.IdentityId.toString();

      this.gridSettingsName = this.userGridService.createUserGridId(this.userId, this.router.url.toString().split('?')[0], 'dashboard');

      this.contractService.getContracts().subscribe(
        contracts => {
          this.contracts = contracts;
          this.loadContracts();

          let order = 0;
          this.userGridService
            .getSettings(this.userId, this.gridSettingsName, this.defaultDashboardHeaders.map(c => c.name))
            .subscribe(result => {
              console.log(result);
              if (result.headers.length > 0) {
                result.headers.forEach(header => {
                  const h = this.defaultDashboardHeaders.find(c => c.name === header);

                  if (h) {
                    h.order = order++;
                    this.headers.push(h);
                  }

                  this.dashboardGridBusy = false;
                });

                this.defaultFilterSet = !!result.kendoGridState;
                if (result.kendoGridState) {
                  this.state = result.kendoGridState;
                  this.gridViewData = process(this.contracts, this.state);
                }
              } else {
                this.headers = this.defaultDashboardHeaders;
              }

              const userPreviousUrl: string = sessionStorage.getItem('user-current-url');
              if (userPreviousUrl && userPreviousUrl.length) {
                sessionStorage.removeItem('user-current-url');
                this.router.navigateByUrl(userPreviousUrl);
                return;
              }
            });
        },
        error => {},
        () => (this.dashboardGridBusy = false)
      );
    });
  }

  public saveDefaultFilter() {
    this.userGridService
      .saveSettings(this.gridSettingsName, this.headers.map(c => c.name), null, this.userId, this.state)
      .subscribe(saveResult => {
        this.alertService.success('Default Filter Saved');
        this.defaultFilterSet = true;
      });
  }

  public clearDefaultFilter() {
    this.userGridService
      .saveSettings(this.gridSettingsName, this.headers.map(c => c.name), null, this.userId, null)
      .subscribe(saveResult => {
        this.alertService.success('Default Filter Cleared');
        this.state.filter = null;
        this.gridViewData = process(this.contracts, this.state);
        this.defaultFilterSet = false;

      });
  }

  public onColumnReorder(event: ColumnReorderEvent) {
    const reorderedColumns = this.helperService.move(this.headers, event.oldIndex, event.newIndex);

    this.userGridService
      .saveSettings(this.gridSettingsName, reorderedColumns.map(c => c.name), null, this.userId, this.state)
      .subscribe(saveResult => {
        this.userGridService.updateUserSettingsCache(saveResult);
        this.headers = reorderedColumns;
      });
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.loadContracts();
  }

  public  filterChange(filter: CompositeFilterDescriptor): void {
    this.state.filter = filter;
    this.loadContracts();
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    console.log('dashboard data state change', state);
    this.loadContracts();
  }

  public navigateToProject(id: string, event: any) {
    event.preventDefault();
    this.router.navigate([`/project-profile/${id}/MainProfile`]);
  }

  public translate(key: string): string {
    return 'test';
  }

  public getColumnTitle(column: GridColumnHeader): string {
    return this.helperService.getColumnTitle(this.i18n.dashboard, column);
  }

  private loadContracts() {
    this.contracts = orderBy(this.contracts, this.state.sort);
    this.gridViewData = process(this.contracts, this.state);
  }

}
