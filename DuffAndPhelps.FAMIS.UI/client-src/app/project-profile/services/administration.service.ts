import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class AdministrationService {

  private groupIdSource = new BehaviorSubject<any>(<any>{});
  public groupIdContext$ = this.groupIdSource.asObservable();

  public groupId: string;

  constructor() {}

  public updateGroupIdContext(groupId: string) {
    const current = this.groupIdSource.getValue();

    current.groupId = groupId;
    this.groupIdSource.next(current);
  }


}
