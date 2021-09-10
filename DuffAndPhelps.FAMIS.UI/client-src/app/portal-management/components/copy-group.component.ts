import { PortalManagementService } from '../services/portal-management.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, ComponentRef, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContractSearchResultDto } from '../../_api/_runtime/dtos/contract-search-result.dto';
import { GroupHierarchyDto } from '../../_api/_runtime/dtos/client-hierarchy.dto';
import { GroupSummaryDto } from '../../_api/dtos/group-summary.dto';
import { HierarchyMemberDto, HierarchySiteDto } from '../../_api/_runtime/dtos/building-hierarchy.dto';

@Component({
  selector: 'copy-group',
  templateUrl: './copy-group.component.html'
})
export class CopyGroupComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  ref: ComponentRef<CopyGroupComponent>;
  toGroupId: string;
  instanceId: string;
  @Output() componentRemoved = new EventEmitter<string>();

  public loading: Subscription;

  public selectedContract: ContractSearchResultDto;
  public selectedGroupHierarchy: GroupHierarchyDto;
  public selectedGroup: GroupSummaryDto;
  public groups: GroupSummaryDto[];
  public selectedMember: HierarchyMemberDto;
  public members: HierarchyMemberDto[];
  public selectedSite: HierarchySiteDto;
  public sites: HierarchySiteDto[];

  constructor(private portalService: PortalManagementService) { }

  ngOnInit(): void {}

  contractChanged(selectedContract: ContractSearchResultDto): void {
    this.selectedContract = selectedContract;
    this.resetGroups();
    this.groups = this.selectedContract.groups
        .filter(g => g.id !== this.toGroupId);
    this.resetMembers();
    this.resetSites();
  }

  groupChanged(selectedGroup: GroupSummaryDto): void {
    this.resetMembers();
    this.loading = this.portalService.getGroupHierarchy(selectedGroup.id).subscribe((res: GroupHierarchyDto) => {
      this.selectedGroupHierarchy = res;
      this.members = res.members;
    });
    this.resetSites();
  }

  memberChanged(selectedMember: HierarchyMemberDto): void {
    this.resetSites();
    this.sites = this.selectedMember.sites;
  }

  remove(): void {
    this.ref.destroy();
    this.componentRemoved.emit(this.instanceId);
  }

  private resetContracts(): void {
    this.selectedContract = null;
  }

  private resetGroups(): void {
    this.selectedGroup = null;
    this.groups = [];
  }

  private resetMembers(): void {
    this.selectedMember = null;
    this.members = [];
  }

  private resetSites(): void {
    this.selectedSite = null;
    this.sites = [];
  }

  ngOnDestroy(): void {
    if (this.loading) {
      this.loading.unsubscribe();
    }
  }
}
