import { AlertService } from '../../_core/services/alert.service';
import { ConsolidationService } from '../services/consolidation.service';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'define-layout',
  templateUrl: './define-layout.component.html'
})
export class DefineLayoutComponent extends ComponentCanDeactivate implements OnDestroy, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  subscription: Subscription;
  public isBusy = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private consolidationService: ConsolidationService,
    private canDeactivateService: CanDeactivateService
  ) {
    super();
  }

  ngOnInit() {
    const groupId = this.route.parent.parent.snapshot.paramMap.get('groupId');
    this.consolidationService.initialize(groupId);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onBack(event: any) {
    this.router.navigate(['./reconcile-data'], {
      relativeTo: this.route.parent
    });
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateComponent(this.consolidationService.defineLayoutDirty);
  }

  public onContinue(event: any): void {
    event.preventDefault();
    this.isBusy = true;
    const validation = this.consolidationService.validateDestinations();
    if (validation.length > 0) {
      this.alertService.error(validation);
      this.isBusy = false;
      return;
    }

    this.subscription = this.consolidationService.saveColumnMappingSettings().subscribe(results => {
      this.consolidationService.defineLayoutDirty = false;

      this.router.navigate(['./map-matchcodes'], {
        relativeTo: this.route.parent
      });
      this.isBusy = false;
    });
  }
}
