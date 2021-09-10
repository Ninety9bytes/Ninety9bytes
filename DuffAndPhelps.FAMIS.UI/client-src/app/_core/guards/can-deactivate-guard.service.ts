import { ComponentCanDeactivate } from './component-can-deactivate';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

// TODO implement interface for canDeactivate for each component that utilizes this service

@Injectable()
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate, route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
