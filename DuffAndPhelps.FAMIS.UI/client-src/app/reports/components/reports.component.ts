import { ReportsService } from '../services/reports.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { ReportsPowerBiComponent } from './reports-power-bi.component';
import { ReportsDeliverablesComponent } from './reports-deliverables.component';
import { SystemPermissionsEnum } from '../../_core/user/permissions';
import { ReportModes } from '../report-modes';
import { UserStore } from '../../_core/user/user.store';
import { User } from '../../_core/user/user';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'reports',
  templateUrl: 'reports.component.html'
})
export class ReportsComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  permissions = SystemPermissionsEnum;
  user: User;
  reportModes = ReportModes;
  mode: ReportModes = ReportModes.Interactive;

  @ViewChild(ReportsPowerBiComponent, {static: false})
  reportsPowerBiComponent: ReportsPowerBiComponent;
  @ViewChild(ReportsDeliverablesComponent, {static: false})
  reportsDeliverablesComponent: ReportsDeliverablesComponent;

  constructor(
    private route: ActivatedRoute,
    private reportsService: ReportsService,
    private userStore: UserStore
  ) { }

  ngOnInit() {
    this.reportsService.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    const selectedMode = this.route.snapshot.queryParams['mode'];
      switch (selectedMode) {
          case '0':
              this.mode = ReportModes.Static;
              break;
          case '1':
              this.mode = ReportModes.Interactive;
              break;
      }

      this.userStore.user.subscribe(currentUser => {
          this.user = currentUser;
      });
  }

  ngOnDestroy() {}
  toggleReportMode(mode: ReportModes) {
    this.mode = mode;
  }

  userCanWriteData() {
    let canWriteData = false;
    if (this.user) {
        const grantedPermissionIndex = this.user.permissions.permissionsGranted.findIndex(c => c === this.permissions.canWriteData);
        canWriteData = grantedPermissionIndex > -1;
    }
    return canWriteData;
  }

}
