import { Renderer2, Directive, Input, OnInit, ElementRef } from '@angular/core';
import { UserStore } from '../user/user.store';
import { SystemPermissionsEnum } from '../user/permissions';

@Directive({
  selector: '[showIfCanAccess]'
})
export class ShowIfCanAccessDirective implements OnInit {
  // The current system permission
  @Input() showIfCanAccess: SystemPermissionsEnum;

  constructor(private el: ElementRef, private renderer: Renderer2, private userStore: UserStore) {}

  ngOnInit(): void {
    let canAccess = false;

    this.userStore.user.subscribe(currentUser => {
      if (currentUser) {
        // Checking if user has access to system permission
        const grantedPermissionIndex = currentUser.permissions.permissionsGranted.findIndex(c => c === this.showIfCanAccess);
        canAccess = grantedPermissionIndex > -1;
      }
    });

    if (!canAccess) {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none');
    }
  }
}
