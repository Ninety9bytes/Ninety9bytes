import { CopyGroupComponent } from './copy-group.component';
import { PortalManagementService } from '../services/portal-management.service';
import { HelperService } from '../../_core/services/helper.service';
import { AlertService } from '../../_core/services/alert.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, Input, ViewChild, ViewContainerRef, ComponentRef, ComponentFactoryResolver } from '@angular/core';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import { Subscription } from 'rxjs';
import { CopyGroupsDto } from '../../_api/_runtime/dtos/copy-groups.dto';

@Component({
  selector: 'setup-data',
  templateUrl: './setup-data.component.html'
})
export class SetupDataComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() group: GroupDto;
  @ViewChild('selections', { read: ViewContainerRef, static: true })
  selectionsContainer: ViewContainerRef;

  public selections: Array<ComponentRef<CopyGroupComponent>> = new Array<ComponentRef<CopyGroupComponent>>();
  public selectionErrors = false;
  public replace = true;
  public waiting: Subscription;

  constructor(
    private componentResolver: ComponentFactoryResolver,
    private portalService: PortalManagementService,
    private helperService: HelperService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
    this.addSelection();
  }

  copyGroups(): void {
    this.selectionErrors = this.hasErrors();
    if (!this.selectionErrors) {
      const dto: CopyGroupsDto = this.buildRequestDto();
      this.waiting = this.portalService.copyGroups(dto).subscribe(res => {
        this.alertService.success('Group Copy successfully completed.');
        this.selections = [];
        this.selectionsContainer.clear();
      },
      error => {
        this.alertService.error('An error has occurred during the Group Copy.');
      });
    }
  }

  buildRequestDto(): CopyGroupsDto {
    const request = <CopyGroupsDto>{
      fromGroupIds: new Array<string>(),
      toGroupId: this.group.id,
      toGroupName: this.group.groupName,
      memberIds: new Array<string>(),
      siteIds: new Array<string>(),
      replace: this.replace
    };

    this.selections.forEach((selection: ComponentRef<CopyGroupComponent>) => {
      const refInstance = selection.instance.ref.instance;

      // Add Groups
      if (refInstance.selectedGroup != null && !request.fromGroupIds.includes(refInstance.selectedGroup.id)) {
        request.fromGroupIds.push(refInstance.selectedGroupHierarchy.id);
      }

      // Add Members
      if (refInstance.selectedMember != null && !request.memberIds.includes(refInstance.selectedMember.id)) {
        request.memberIds.push(refInstance.selectedMember.id);
      }

      // Add Sites
      if (refInstance.selectedSite != null && !request.siteIds.includes(refInstance.selectedSite.id)) {
        request.siteIds.push(refInstance.selectedSite.id);
      }

    });

    return request;
  }

  addSelection(): void  {
    const comp = this.componentResolver.resolveComponentFactory(CopyGroupComponent);
    const selection = this.selectionsContainer.createComponent(comp);

    // Input References
    selection.instance.instanceId = this.helperService.generateGuid();
    selection.instance.toGroupId = this.group.id;
    selection.instance.ref = selection;

    selection.instance.componentRemoved.subscribe((instanceId: string) => {
      this.removeComponent(instanceId);
    });

    this.selections.push(selection);
  }

  removeComponent(instanceId: string): void {
    this.selections.forEach((selection: ComponentRef<CopyGroupComponent>, index: number) => {
      if (selection.instance.instanceId === instanceId) {
        this.selections.splice(index, 1);
      }
    });
  }

  hasErrors(): boolean {
    for (let i = 0; i < this.selections.length; i++) {
        const selection: ComponentRef<CopyGroupComponent> = this.selections[i];
        const refInstance = selection.instance.ref.instance;
        if (refInstance.selectedContract == null || refInstance.selectedGroup == null) {
          return true;
        }
    }
    return false;
  }

  hasSelections(): boolean {
    return this.selections.length > 0;
  }

  ngOnDestroy(): void {
    if (this.waiting) {
      this.waiting.unsubscribe();
    }
  }
}
