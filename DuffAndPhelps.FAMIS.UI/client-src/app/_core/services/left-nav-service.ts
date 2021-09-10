import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LeftNavService {

  constructor() {}

  private navCollapsedSource = new BehaviorSubject<boolean>(false);
  public navCollapsed$ = this.navCollapsedSource.asObservable();

  public toggleCollapsed(isCollapsed: boolean) {
    this.navCollapsedSource.next(isCollapsed);
  }
}
