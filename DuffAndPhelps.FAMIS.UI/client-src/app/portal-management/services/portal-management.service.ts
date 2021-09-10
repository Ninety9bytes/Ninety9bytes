
import {map} from 'rxjs/operators';
import { ContractSearchResultDto } from '../../_api/_runtime/dtos/contract-search-result.dto';
import { ConfigService } from '@ngx-config/core';
import { Injectable } from '@angular/core';
import { ContractApiService } from '../../_api/_runtime/services/contract-api.service';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { ClientApiService } from '../../_api/_runtime/services/client-api.service';
import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { ImageApiService } from '../../_api/_runtime/services/image-api.service';
import { Observable } from 'rxjs';
import { ContractSummaryDto } from '../../_api/dtos/contract-summary.dto';
import { GroupTemplateDto } from '../../_api/_runtime/dtos/group-template.dto';
import { GroupTemplateRequestDto } from '../../_api/_runtime/dtos/group-template-request.dto';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import { UpdateGroupDto } from '../../_api/_runtime/dtos/update-group.dto';
import { ClientDto } from '../../_api/_runtime/dtos/client.dto';
import { ClientHierarchyDto, GroupHierarchyDto } from '../../_api/_runtime/dtos/client-hierarchy.dto';
import { CopyGroupsDto } from '../../_api/_runtime/dtos/copy-groups.dto';
import { ImageDto } from '../../_api/_runtime/dtos/image.dto';
import {ContractGroupSummaryDto} from '../../_api/_runtime/dtos/contract-group-summary.dto';

@Injectable()
export class PortalManagementService {

  private masterTemplateId = this.configService.getSettings('masterTemplateId');

  constructor(
    private contractService: ContractApiService,
    private groupService: GroupApiService,
    private clientService: ClientApiService,
    private insuranceService: InsuranceApiService,
    private imageService: ImageApiService,
    private configService: ConfigService
  ) {}

  public getPortalContracts(): Observable<ContractSummaryDto[]> {
    return this.contractService.getContracts(true).pipe(map(res => {
      this.sortContracts(res);
      return res.filter(contractSummary => contractSummary.groupIds.length > 0);
    }));
  }

  public getNonPortalContracts(query: string): Observable<ContractSearchResultDto[]> {
    return this.contractService.searchContracts(query, true).pipe(map(res => {
      return res.filter(contractSummary => contractSummary.groups.filter(a => a.id.length === 0));
    }));
  }


  public searchPortalContracts(query: string): Observable<ContractSearchResultDto[]> {
    return this.contractService.searchContracts(query).pipe(map(res => {
      return res.filter(contractSummary => contractSummary.groups.filter(a => a.id.length === 0));
    }));
  }

  public getContractGroups(query: string): Observable<GroupDto[]> {
    return this.contractService.getContractsGroups(query, true).pipe(map(res => res.map(group => ({id: group.id, groupName: group.groupName}))));
  }

  public createPortalGroup(selectedContractId: string, accountName: string, selectedAccountId: string): Observable<GroupTemplateDto> {
    const dto: GroupTemplateRequestDto = {
      contractId : selectedContractId,
      groupName: accountName,
      templateId: this.masterTemplateId,
      isPortal: true,
      groupId: selectedAccountId
    };
    return this.groupService.createGroup(dto);
  }

  public getGroup(groupId: string): Observable<GroupDto> {
    return this.groupService.getGroup(groupId);
  }

  public updateGroup(group: GroupDto): Observable<GroupDto> {
    const dto: UpdateGroupDto = {
      groupId: group.id,
      groupName: group.groupName,
      isDisabled: group.isDisabled,
      isPortal: true,
      templateId: this.masterTemplateId
    };
    return this.groupService.updateGroup(dto);
  }

  public getClients(): Observable<ClientDto[]> {
    return this.clientService.getClients();
  }

  public getClientHierarchy(clientId: string): Observable<ClientHierarchyDto> {
    return this.clientService.getHierarchyByClient(clientId);
  }

  public copyGroups(request: CopyGroupsDto): Observable<string> {
    return this.groupService.copyGroups(request);
  }

  public searchContracts(query: string): Observable<ContractSearchResultDto[]> {
    return this.contractService.searchContracts(query);
  }

  public getGroupHierarchy(groupId: string): Observable<GroupHierarchyDto> {
    return this.insuranceService.getGroupHierarchy(groupId);
  }

  private sortContracts(contracts: ContractSummaryDto[]) {
    contracts.sort((left, right): number => {
      if (left.client < right.client) { return -1; }
      if (left.client > right.client) { return 1; }
      return 0;
    });
  }

  public removePortalImage(imageId: string): Observable<boolean> {
    return this.imageService.deleteImage(imageId);
  }

  public upsertPortalImage(groupId: string, imageName: string, image: File): Observable<ImageDto> {
    return this.imageService.upsertPortalImage(groupId, imageName, image);
  }

  public getPortalImage(groupId: string): Observable<ImageDto> {
     return this.imageService.getPortalImage(groupId);
  }
}
