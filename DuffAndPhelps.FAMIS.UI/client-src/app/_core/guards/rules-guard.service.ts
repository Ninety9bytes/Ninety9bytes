import { SetupComponent } from '../../reconciliation/components/setup.component';
import { AlertService } from '../services/alert.service';
import { Injectable } from '@angular/core';
import { CanDeactivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlSegment } from '@angular/router';


@Injectable()
export class RulesGuard implements CanDeactivate<SetupComponent> {
  constructor(private router: Router, private alertService: AlertService) {}

  canDeactivate(
    target: SetupComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): boolean {
    const segments: UrlSegment[] = this.router.parseUrl(nextState.url).root.children.primary.segments;

    if ((!target.selectedCostField || target.selectedCostField === 'undefined') && segments[2] && segments[2].path === 'Reconciliation') {
      this.alertService.error('Please select an Allocation Field to continue.');
      return false;
    } else {
      return true;
    }
  }
}
