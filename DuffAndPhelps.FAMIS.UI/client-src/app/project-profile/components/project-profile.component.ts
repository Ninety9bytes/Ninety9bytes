import { ProjectProfileService } from '../services/project-profile.service';
import { SystemPermissionsEnum } from '../../_core/user/permissions';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { LeftNavService } from '../../_core/services/left-nav-service';
import { inOutFromLeftSideAnimation } from '../../_core/animations/in-out-from-left-side.animation';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';
import { ProjectProfile } from '../../_models/project-profile.model';
import { ActivatedRoute } from '@angular/router';
import { ContractGroupSummaryDto } from '../../_api/_runtime/dtos/contract-group-summary.dto';
import { ProjectModuleDto } from '../../_api/dtos/project-module.dto';
import { ViewContainerRef, ViewChild, OnInit, OnDestroy, Component } from '@angular/core';
import { AlertService } from '../../_core/services/alert.service';


@Component({
  selector: 'app-project-profile',
  templateUrl: './project-profile.component.html',
  animations: [inOutFromLeftSideAnimation]
})
export class ProjectProfileComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  private destroyed$ = new Subject<any>();

  public selectedModule: any;
  public groupName: string;
  public accountName: string;

  public permissions = SystemPermissionsEnum;

  public projectProfile = <ProjectProfile>{};

  @ViewChild('famisModuleContainer', { read: ViewContainerRef, static: false })
  public famisModuleContainer: ViewContainerRef;
  public enabledModules: Array<ProjectModuleDto>;
  public currentGroupId = '';

  public groups = new Array<ContractGroupSummaryDto>();
  public isCollapsed = false;

  /* A Subject for monitoring the destruction of the component. */
  constructor(
    private projectProfileService: ProjectProfileService,
    private route: ActivatedRoute,
    private leftNavService: LeftNavService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    const s = this;

    this.leftNavService.navCollapsed$.subscribe(val => {
      this.isCollapsed = val;
    });

    this.currentGroupId = this.route.snapshot.paramMap.get('groupId');
    const selectedModuleId = this.route.firstChild.snapshot.paramMap.get('moduleId');

    const getModules = this.projectProfileService.getModules();
    const getTemplateForGroup = this.projectProfileService.getTemplateForGroup(this.currentGroupId);
    const getContract = this.projectProfileService.getContractGroup(this.currentGroupId);
    const CheckOtherUserExists = this.projectProfileService.logGroupandCheckOtherUser(this.currentGroupId);

      forkJoin(getModules, getTemplateForGroup, getContract, CheckOtherUserExists)
      .pipe(takeUntil(s.destroyed$))
      .subscribe(([modules, template, contract,otherUserExists]) => {

        if (contract) {
          s.groupName = contract.groupName;
          s.accountName = contract.contractName;

          s.projectProfileService.getContractGroups(contract.contractId).subscribe(groups => {
            this.groups = groups;
          });
        }

        if (modules && template) {
          const updated = <ProjectProfile>{
            template: template,
            selectedGroupId: this.currentGroupId,
            selectedModule: selectedModuleId,
            modules: modules
          };

          this.projectProfileService.updateProjectProfile(updated);

          s.enabledModules = this.projectProfileService.mapSelectedModules(template, modules);

        }
        if(otherUserExists){
          this.alertService.info("Other user is currently in the processing group");
        }
      });
  }

  isEnabled(famisModuleId: string): boolean {

    if (this.enabledModules) {
      return this.enabledModules.findIndex(c => c.name === famisModuleId) !== -1;
    } else {
      return false;
    }
  }

  onGroupSelected(selectedGroupId: string) {
    window.location.href = `/project-profile/${selectedGroupId}/MainProfile`;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.projectProfileService.clearProjectProfile();
  }
}
