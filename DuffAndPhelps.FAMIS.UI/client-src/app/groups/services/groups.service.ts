import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupTemplateDto } from '../../_api/_runtime/dtos/group-template.dto';
import { TemplatesApiService } from '../../_api/_configuration/services/templates-api.service';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { ContractGroupsTemplateDto } from '../../_api/_runtime/dtos/contract-groups-template.dto';

@Injectable()
export class GroupsService {

  private groupTemplateGridDataSource =
    new BehaviorSubject<Array<GroupTemplateDto>>(new Array<GroupTemplateDto>());

  public groupTemplateGridData$ = this.groupTemplateGridDataSource.asObservable();

  constructor(
    private templateApiService: TemplatesApiService,
    private groupApiService: GroupApiService
  ) {}

  public groupId: string;

  getTemplateForGroup(groupId: string) {
    return this.templateApiService.GetTemplateForGroup(groupId);
  }

  updateGroupTemplateResults(groupId: string): Observable<ContractGroupsTemplateDto> {
    return this.groupApiService.getContractGroupTemplate(groupId);
  }

  setGroupTemplateDataSource(data: Array<GroupTemplateDto>): void {
    this.groupTemplateGridDataSource.next(data);
  }
}
