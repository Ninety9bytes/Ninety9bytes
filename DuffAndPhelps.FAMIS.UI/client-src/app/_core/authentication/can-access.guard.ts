import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserStore } from '../user/user.store';
import { SubscriberEntity } from '../subscriber-entity';
import { SystemPermissionsEnum } from '../user/permissions';

@Injectable()
export class CanAccessGuard extends SubscriberEntity implements CanActivate {
  constructor(private router: Router, private userStore: UserStore) {
    super();
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    let canAccess = false;

    const permissions = route.data['permissions'] as Array<SystemPermissionsEnum>;

    return new Promise((resolve, reject) => {
      this.userStore.user.subscribe(currentUser => {
        if (currentUser) {
          // Checking if user has access to system permission
          permissions.forEach(permission => {
            const grantedPermissionIndex = currentUser.permissions.permissionsGranted.findIndex(c => c === permission);
            canAccess = grantedPermissionIndex > -1;
          });
        }
      });

      if (canAccess) {
        resolve(true);
      } else {
        this.router.navigate(['error/403']);
        resolve(false);
      }
    });
  }
}
