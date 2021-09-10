import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserStore } from '../user/user.store';
import { SubscriberEntity } from '../subscriber-entity';
import { AuthenticationManager } from './authentication.manager';

@Injectable()
export class AuthGuard extends SubscriberEntity implements CanActivate {
  constructor(private router: Router, private userStore: UserStore, private authenticationManager: AuthenticationManager) {
    super();
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    return new Promise((resolve, reject) => {
      this.subscribeDefined(this.userStore.hasAnyAuth(), (hasAnyAuth: boolean) => {
        if (hasAnyAuth) {
          resolve(true);
        } else {
          this.userStore.loginUser();
          resolve(false);
        }
      });
    });
  }
}
