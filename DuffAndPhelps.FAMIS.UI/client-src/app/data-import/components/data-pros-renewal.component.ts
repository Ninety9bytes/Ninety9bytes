import { CopyGroupComponent } from '../../portal-management/components/copy-group.component';

import { DataCopyService } from '../services/data-copy.service';
import { HelperService } from '../../_core/services/helper.service';
import { AlertService } from '../../_core/services/alert.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { ComponentRef, ComponentFactoryResolver, ViewContainerRef, ViewChild, OnDestroy, OnInit, Component } from '@angular/core';
import { DataTargetName } from '../../_enums/data-target-name';
import { CopyGroupsDto } from '../../_api/_runtime/dtos/copy-groups.dto';
import { DataTarget } from '../../_models/data-target.model';
import { ActivatedRoute } from '@angular/router';
import { WizardService } from '../../_ui/services/wizard.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-pros-renewal',
  templateUrl: './data-pros-renewal.component.html'
})
export class DataProsRenewalComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @ViewChild('selections', { read: ViewContainerRef, static: true })
  selectionsContainer: ViewContainerRef;
  public groupId: string;
  public dataTargetName: string;
  public dataAlreadyExists = false;
  public availableDataTargets: Array<DataTarget> = new Array<DataTarget>();
  public selections: Array<ComponentRef<CopyGroupComponent>> = new Array<ComponentRef<CopyGroupComponent>>();
  public selectionErrors = false;
  public replace = true;
  public waiting: Subscription;
  model = {
    copyType: ''
  };

  constructor(
    private wizardService: WizardService,
    private componentResolver: ComponentFactoryResolver,
    private route: ActivatedRoute,
    private dataCopyService: DataCopyService,
    private helperService: HelperService,
    private translateService: TranslationManager
  ) {}

  ngOnInit() {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.waiting = this.dataCopyService.getDataTargets().subscribe(result => {
      this.availableDataTargets = result.filter((dataTarget: DataTarget) => {
        return dataTarget.name === 'Client Inventory' || dataTarget.name === 'Actual Inventory';
      });
    });

    this.dataTargetName = this.dataCopyService.activeDataTargetName;
    this.replace = this.dataCopyService.activeReplace || true;
    if (this.dataCopyService.activeSelections) {
      this.dataCopyService.activeSelections.forEach((selection: ComponentRef<CopyGroupComponent>) => {
        this.addSelection(selection);
      });
    } else {
      this.addSelection();
    }
  }

  prosRenewal(): void {
    this.selectionErrors = this.hasErrors();
    if (!this.selectionErrors) {
      this.dataCopyService.activeDataTargetName = this.dataTargetName;
      this.dataCopyService.activeReplace = this.replace;
      this.dataCopyService.activeSelections = this.selections;

      const dto: CopyGroupsDto = this.buildRequestDto();
      dto.prosRenewal = true;
      this.waiting = this.dataCopyService.copyGroups(dto).subscribe(
        res => {
          this.dataCopyService.isError = false;
          this.wizardService.setActiveTab('step-2-copy');
        },
        error => {
          this.dataCopyService.isError = true;
          this.dataCopyService.errorMessage = this.translateService.instant(this.i18n.dataImport + error.error.message);
          this.wizardService.setActiveTab('step-2-copy');
        }
      );
    }
  }

  buildRequestDto(): CopyGroupsDto {
    const request = <CopyGroupsDto>{
      fromGroupIds: new Array<string>(),
      toGroupId: this.groupId,
      dataTargetTo: null,
      memberIds: new Array<string>(),
      siteIds: new Array<string>(),
      replace: this.replace
    };

    if (this.dataTargetName === 'Client Inventory') {
      request.dataTargetTo = DataTargetName.client;
    } else if (this.dataTargetName === 'Actual Inventory') {
      request.dataTargetTo = DataTargetName.inventory;
    }

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

    this.dataCopyService.copyFromGroupIds = request.fromGroupIds;
    return request;
  }

  addSelection(existing?: ComponentRef<CopyGroupComponent>): void {
    const comp = this.componentResolver.resolveComponentFactory(CopyGroupComponent);
    const selection = this.selectionsContainer.createComponent(comp);

    // Input References
    if (existing) {
      selection.instance.instanceId = existing.instance.instanceId;
      selection.instance.toGroupId = existing.instance.toGroupId;
      selection.instance.selectedContract = existing.instance.selectedContract;
      selection.instance.selectedGroupHierarchy = existing.instance.selectedGroupHierarchy;
      selection.instance.selectedGroup = existing.instance.selectedGroup;
      selection.instance.groups = existing.instance.groups;
      selection.instance.selectedMember = existing.instance.selectedMember;
      selection.instance.members = existing.instance.members;
      selection.instance.selectedSite = existing.instance.selectedSite;
      selection.instance.sites = existing.instance.sites;
      selection.instance.ref = selection;
    } else {
      selection.instance.instanceId = this.helperService.generateGuid();
      selection.instance.toGroupId = this.groupId;
      selection.instance.ref = selection;
    }

    selection.instance.componentRemoved.subscribe((instanceId: string) => {
      this.removeComponent(instanceId);
    });

    this.selections.push(selection);
  }

  dataTargetChanged(dataTargetName: string): void {
    let dataTarget: DataTargetName;
    if (dataTargetName === 'Client Inventory') {
      dataTarget = DataTargetName.client;
    } else if (dataTargetName === 'Actual Inventory') {
      dataTarget = DataTargetName.inventory;
    }

    this.dataCopyService.getAssetCount(this.groupId, dataTarget, true).subscribe(
      (res: number) => {
        if (!res || res === 0) {
          this.dataAlreadyExists = false;
        } else {
          this.dataAlreadyExists = true;
        }
      },
      error => {
        this.dataAlreadyExists = false;
      }
    );
  }

  removeComponent(instanceId: string): void {
    this.selections.forEach((selection: ComponentRef<CopyGroupComponent>, index: number) => {
      if (selection.instance.instanceId === instanceId) {
        this.selections.splice(index, 1);
      }
    });
  }

  hasErrors(): boolean {
    if (!this.dataTargetName || this.dataTargetName === '') {
      return true;
    }

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

  updateCopyType(event: any) {
    this.replace = event.target.value === 'replace';
  }
}
