import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
///import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { ActivatedRoute } from '@angular/router';
import { ApiServiceResult } from '../../_api/dtos/api-service-result.dto';
import { InventoryApiService } from '../../_api/_runtime/services/inventory-api.service';

@Injectable()
export class RemoveDeactivatedService {
  //private savePointGridDataSource = new BehaviorSubject<Array<GroupSave>>(new Array<GroupSave>());
  //public savePointGridData$ = this.savePointGridDataSource.asObservable();
  public dataTarget: number;

  constructor(
    //private groupApiService: GroupApiService,
    private inventoryApiService: InventoryApiService,
    private route: ActivatedRoute,
  ) {}

  groupId: string;

  public RemoveDeactivatedItems(groupId: string, type: number, datatarget: string): Observable<any> {
    return this.inventoryApiService.removeDeactivatedItems(groupId, type, datatarget);
  }

}
