// Components
import { DashboardComponent } from './dashboard/components/dashboard.component';
import { ProjectProfileComponent } from './project-profile/components/project-profile.component';
import { ReconciliationFormComponent } from './reconciliation/components/reconciliation-form.component';
import { TemplateFormComponent } from './project-profile/components/template-form.component';
import { SetupComponent } from './reconciliation/components/setup.component';
import { ReconcileDataComponent } from './reconciliation/components/reconcile-data.component';
import { RulesGuard } from './_core/guards/rules-guard.service';
import { UserListComponent } from './admin/components/user/user-list.component';
import { TemplateManagementComponent } from './admin/components/template/template-management.component';
import { ConfigLoader, ConfigStaticLoader } from '@ngx-config/core';
import { ConfigHttpLoader } from '@ngx-config/http-loader';
import { environment } from '../environments/environment';
import { DashboardHomeComponent } from './dashboard/components/dashboard-home.component';
import { NotFoundComponent } from './error/not-found.component';
import { UnauthorizedComponent } from './error/unauthorized.component';
import { AccessDeniedComponent } from './error/access-denied.component';
import { InternalServerErrorComponent } from './error/internal-server-error.component';
import { AdminHomeComponent } from './admin/components/admin-home.component';
import { TeamHomeComponent } from './admin/components/team/team-home.component';
import { TemplateBuilderWizardComponent } from './admin/components/template/wizard/template-builder-wizard.component';
import { DataImportParentComponent } from './data-import/components/data-import-parent.component';
import { TaskManagementComponent } from './project-profile/components/tasks/task-management.component';
import { MassMatchComponent } from './reconciliation/components/mass-match/mass-match.component';
import { DefineLayoutComponent } from './reconciliation/components/define-layout.component';
import { MapMatchCodesComponent } from './reconciliation/components/map-matchcodes.component';
import { ViewMatchesComponent } from './reconciliation/components/mass-match/view-matches.component';
import { FinalizeDataComponent } from './reconciliation/components/finalize-data.component';
import { AdministrationComponent } from './project-profile/components/administration/administration.component';
import { TrendingSummaryComponent } from './processing/trending/components/trending-summary.component';
import { TrendingFormComponent } from './processing/trending/components/trending-form.component';
import { TrendingSetupComponent } from './processing/trending/components/trending-setup.component';
import { DepreciationSummaryComponent } from './processing/depreciation/components/depreciation-summary.component';
import { DepreciationFormComponent } from './processing/depreciation/components/depreciation-form.component';
import { DepreciationSetupComponent } from './processing/depreciation/components/depreciation-setup.component';
import { GroupManagementComponent } from './groups/components/group-management.component';
import { EditGroupTemplateComponent } from './groups/components/edit-group-template.component';
import { GroupManagementFormComponent } from './groups/components/group-management-form.component';
import { QualityControlComponent } from './quality-control/components/quality-control.component';
import { MassUpdateFormComponent } from './quality-control/components/mass-update/mass-update-form.component';
import { MassUpdateCriteriaComponent } from './quality-control/components/mass-update/mass-update-criteria.component';
import { MassUpdateResultsComponent } from './quality-control/components/mass-update/mass-update-results.component';
import { QualityControlFormComponent } from './quality-control/components/quality-control-form.component';
import { DuplicateCheckComponent } from './quality-control/components/duplicate-check/duplicate-check.component';
import { AddContentComponent } from './quality-control/components/content/actions/add-content.component';

import { HeaderManagementComponent } from './header-management/components/header-management.component';
import { PortalManagementComponent } from './portal-management/components/portal-management.component';
import { AdministrationFormComponent } from './project-profile/components/administration/administration-form.component';
import { TransactionsGridComponent } from './transactions/components/transactions-grid.component';
import { EditContentComponent } from './quality-control/components/content/actions/edit-content.component';
import { MassUpdateContentComponent } from './quality-control/components/content/actions/mass-update-content.component';
import { MassUpdateBuildingComponent } from './quality-control/components/building/actions/mass-update-building.component';
import { RecipientsGridComponent } from './recipients/components/recipients-grid.component';
import { ConflictServerErrorComponent } from './error/conflict-transaction-error.component';
import { RecipientsComponent } from './recipients/components/recipients.component';
import { GroupSaveComponent } from './admin/components/group-saves/group-save.component';
import { CanDeactivateGuard } from './_core/guards/can-deactivate-guard.service';
import { AuthGuard } from './_core/authentication/auth-guard';
import { HomeComponent } from './home.component';
import { SystemPermissionsEnum } from './_core/user/permissions';
import { CanAccessGuard } from './_core/authentication/can-access.guard';
import { ViewContentComponent } from './quality-control/components/content/actions/view-content.component';
import { ReportsComponent } from './reports/components/reports.component';
import { ReportsDeliverablesComponent } from './reports/components/reports-deliverables.component';
import { FileUploadComponent } from './file-upload/components/file-upload/file-upload.component';
import { UpsertBuildingComponent } from './quality-control/components/building/form/building-form.component';
import { Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SupportComponent } from './support/components/support.component';
import { RemoveDeactivatedComponent } from './admin/components/remove-deactivated/remove-deactivated.component';

const systemPermissionsEnum = SystemPermissionsEnum;

export const routeConfig: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard/all-projects' },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardHomeComponent,
        children: [
          {
            path: '',
            redirectTo: 'all-projects',
            pathMatch: 'full'
          },
          {
            path: 'all-projects',
            component: DashboardComponent
          }
        ]
      },
      /* Going further, please add any error code routes that need Translation Service injection
         into their components, to perform translations in here as a child to the HomeComponent,
         where we don't need any of the user or group context data to render the error.
         Why? The injection fails, otherwise.
      */
      {
        path: 'error/409',
        component: ConflictServerErrorComponent
      },
      {
        path: 'portal-management',
        component: PortalManagementComponent,
        canActivate: [CanAccessGuard],
        data: { permissions: [systemPermissionsEnum.canManagePortal] }
      },
      {
        path: 'Admin',
        component: AdminHomeComponent,
        children: [
          {
            path: 'users',
            component: UserListComponent
          },
          {
            path: 'teams',
            component: TeamHomeComponent
          },
          {
            path: 'template-builder/:templateId',
            component: TemplateBuilderWizardComponent
          }
        ]
      },
      {
        path: 'project-profile/:groupId',
        component: ProjectProfileComponent,
        children: [
          {
            path: '',
            component: TemplateFormComponent
          },
          {
            path: 'Reconciliation',
            canDeactivate: [CanDeactivateGuard],
            component: ReconciliationFormComponent,
            children: [
              { path: '', component: SetupComponent, canDeactivate: [CanDeactivateGuard, RulesGuard] },
              { path: 'setup', component: SetupComponent, canDeactivate: [CanDeactivateGuard, RulesGuard] },
              { path: 'reconcile-data', component: ReconcileDataComponent, canDeactivate: [CanDeactivateGuard] },
              { path: 'mass-match', component: MassMatchComponent },
              { path: 'view-matches', component: ViewMatchesComponent },
              { path: 'define-layout', component: DefineLayoutComponent, canDeactivate: [CanDeactivateGuard] },
              { path: 'finalize-data', component: FinalizeDataComponent },
              { path: 'map-matchcodes', component: MapMatchCodesComponent, canDeactivate: [CanDeactivateGuard] },
              { path: 'mass-match', component: MassMatchComponent }
            ]
          },
          {
            path: 'TaskManagement',
            component: TaskManagementComponent
          },
          {
            path: 'Trending',
            component: TrendingFormComponent,
            children: [
              { path: '', component: TrendingSetupComponent },
              { path: 'Setup', component: TrendingSetupComponent },
              { path: 'Summary', component: TrendingSummaryComponent }
            ]
          },
          {
            path: 'Depreciation',
            component: DepreciationFormComponent,
            children: [
              { path: '', component: DepreciationSetupComponent },
              { path: 'Setup', component: DepreciationSetupComponent },
              { path: 'Summary', component: DepreciationSummaryComponent }
            ]
          },
          {
            path: 'DataImport',
            component: DataImportParentComponent
          },
          {
            path: 'Administration',
            component: AdministrationFormComponent,
            children: [
              {
                path: '',
                component: AdministrationComponent
              },
              {
                path: 'Transactions',
                component: TransactionsGridComponent
              }
            ]
          },
          {
            path: 'group-save',
            component: GroupSaveComponent
          },
          {
            path: 'remove-deactivated',
            component: RemoveDeactivatedComponent
          },
          {
            path: 'Groups',
            component: GroupManagementFormComponent,
            children: [
              { path: '', component: GroupManagementComponent },
              { path: 'Management', component: GroupManagementComponent },
              {
                path: 'EditForms',
                component: EditGroupTemplateComponent,
                canActivate: [CanAccessGuard],
                data: { permissions: [systemPermissionsEnum.canManageTemplates] }
              }
            ],
            canActivate: [CanAccessGuard],
            data: { permissions: [systemPermissionsEnum.canWriteData] }
          },
          {
            path: 'QualityControl',
            component: QualityControlComponent,
            canDeactivate: [CanDeactivateGuard],
            data: { title: 'Quality Control' },
            children: [
              { path: '', component: QualityControlFormComponent },
              { path: 'AddContent', component: AddContentComponent, canDeactivate: [CanDeactivateGuard], data: { title: 'Add Content' } },
              {
                path: 'EditContent/:contentId',
                component: EditContentComponent,
                canDeactivate: [CanDeactivateGuard],
                data: { title: 'Edit Content' }
              },
              { path: 'ViewContent/:contentId', component: ViewContentComponent, canDeactivate: [CanDeactivateGuard] },
              {
                path: 'AddBuilding',
                component: UpsertBuildingComponent,
                canDeactivate: [CanDeactivateGuard],
                data: { title: 'Add Building' }
              },
              {
                path: 'EditBuilding/:buildingId',
                component: UpsertBuildingComponent,
                canDeactivate: [CanDeactivateGuard],
                data: { title: 'Edit Building' }
              },
              { path: 'ViewBuilding/:buildingId', component: UpsertBuildingComponent, canDeactivate: [CanDeactivateGuard] },
              {
                path: 'MassUpdate',
                component: MassUpdateFormComponent,
                data: { title: 'Mass Update' },
                children: [
                  { path: '', component: MassUpdateCriteriaComponent, data: { title: 'Mass Update' } },
                  { path: 'Content', component: MassUpdateContentComponent, data: { title: 'Mass Update' } },
                  { path: 'Building', component: MassUpdateBuildingComponent, data: { title: 'Mass Update' } },
                  { path: 'Criteria', component: MassUpdateCriteriaComponent, data: { title: 'Mass Update' } },
                  { path: 'Results', component: MassUpdateResultsComponent, data: { title: 'Mass Update' } }
                ]
              },
              {
                path: 'DuplicateCheck',
                component: DuplicateCheckComponent
              }
            ]
          },
          {
            path: 'HeaderManagement',
            component: HeaderManagementComponent
          },
          {
            path: 'Recipients',
            component: RecipientsComponent,
            children: [{ path: '', component: RecipientsGridComponent }]
          },
          {
            path: 'Reports',
            component: ReportsComponent,
            children: [{ path: '', component: ReportsDeliverablesComponent }]
          },
          {
            path: 'FileUpload',
            component: FileUploadComponent
          },
          {
            path: 'Support',
            component: SupportComponent
          },
          { path: ':moduleId', component: TemplateFormComponent, canDeactivate: [CanDeactivateGuard] }
        ]
      },
      // {
      //   path: 'Support',
      //   component: SupportComponent
      // },
      {
        path: 'admin/templates',
        component: TemplateManagementComponent,
        canActivate: [CanAccessGuard],
        data: { permissions: [systemPermissionsEnum.canManageTemplates] }
      },
      {
        path: 'admin/templates/builder',
        component: TemplateBuilderWizardComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [CanAccessGuard],
        data: { permissions: [systemPermissionsEnum.canManageTemplates] }
      },
      {
        path: 'admin/templates/builder/:templateId',
        component: TemplateBuilderWizardComponent,
        canDeactivate: [CanDeactivateGuard],
        canActivate: [CanAccessGuard],
        data: { permissions: [systemPermissionsEnum.canManageTemplates] }
      }
    ],
    canActivate: [AuthGuard]
  },

  {
    path: 'error/401',
    component: UnauthorizedComponent
  },
  {
    path: 'error/403',
    component: AccessDeniedComponent
  },
  {
    path: 'error/404',
    component: NotFoundComponent
  },
  {
    path: 'error/500',
    component: InternalServerErrorComponent
  },
  { path: '**', redirectTo: 'error/404' }
];

export class AppConfiguration {
  private static configHttpFactory(http: HttpClient): ConfigLoader {
    return new ConfigHttpLoader(http, environment.settingsEndpoint); // API ENDPOINT
  }

  private static configFactory(): ConfigLoader {
    return new ConfigStaticLoader(environment);
  }

  public static getConfigFactory() {
    if (environment.useAzureAppSettings) {
      return AppConfiguration.configHttpFactory; // use configHttpFactory to pull from web service
    }

    return AppConfiguration.configFactory; // Use configFactory to pull from Angular environment settings
  }
}
