import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { GroupSave } from '../../_models/group-save.model';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { ActivatedRoute } from '@angular/router';
import { GroupSaveSortTermDto } from '../../_api/_runtime/dtos/group-save-sort-term.dto';
import { GroupSaveFilterTermDto } from '../../_api/_runtime/dtos/group-save-filter-term.dto';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';

@Injectable()
export class GroupSaveService {
  private savePointGridDataSource = new BehaviorSubject<Array<GroupSave>>(new Array<GroupSave>());
  public savePointGridData$ = this.savePointGridDataSource.asObservable();
  public dataTarget: number;

  constructor(
    private groupApiService: GroupApiService,
    private route: ActivatedRoute,
  ) {}

  groupId: string;

  public clearGroupSave() {
    this.savePointGridDataSource.next(new Array<GroupSave>());
  }

  public updateGroupSaveData(
    groupId: string,
    skip: number,
    take: number,
    sortTerms: Array<GroupSaveSortTermDto> = new Array<GroupSaveSortTermDto>(),
    filterTerms: Array<GroupSaveFilterTermDto> = new Array<GroupSaveFilterTermDto>()
  ): Observable<Array<GroupSave>> {
    this.groupId = groupId;
    return this.getGroupSavePoints(this.groupId);
  }

  public getGroupSavePoints(groupId: string): Observable<Array<GroupSave>> {
    return this.groupApiService.getGroupSavePoints(groupId);
  }

  public setGroupSavePoints(groupId: string, description: string): Observable<ApiServiceResult<GroupSave>> {
    return this.groupApiService.setGroupSavePoint(groupId, description);
  }

  public restoreToSavePoint(request: GroupSave): Observable<string> {
    return this.groupApiService.restoreToSavePoint(request, true);
  }

  public setSavePointGridDataSource(data: Array<GroupSave>): void {
    this.savePointGridDataSource.next(data);
  }
}
