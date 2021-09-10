import { ConsolidationService } from '../services/consolidation.service';
import { ComponentCanDeactivate } from '../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'map-matchcodes',
  templateUrl: './map-matchcodes.component.html'
})
export class MapMatchCodesComponent extends ComponentCanDeactivate implements OnDestroy, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  subscription: Subscription;
  public isBusy = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    this.router.navigate(['./define-layout'], {
      relativeTo: this.route.parent
    });
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateComponent(this.consolidationService.mapMatchCodesDirty);
  }

  onContinue(event: any) {
    event.preventDefault();
    this.isBusy = true;
    this.subscription = this.consolidationService.saveColumnMappingAssignments().subscribe(results => {
      this.consolidationService.mapMatchCodesDirty = false;
      this.router.navigate(['./finalize-data'], { relativeTo: this.route.parent });
      this.isBusy = false;
    });
  }
}
