import { ReconcileDataService } from '../services/reconcile-data.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';
import { BreadCrumb } from '../../_models/breadcrumbs.model';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'reconciliation-form',
  templateUrl: './reconciliation-form.component.html'
})
export class ReconciliationFormComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public moduleName = 'Reconciliation';

  public reconciliationBreadcrumbs = Array<BreadCrumb>();
  public massMatchBreadcrumbs = Array<BreadCrumb>();
  public activeBreadcrumbs = Array<BreadCrumb>();

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private reconcileDataService: ReconcileDataService,
    private route: ActivatedRoute) {}

  ngOnInit() {

    this.reconcileDataService.groupId = this.route.parent.snapshot.paramMap.get('groupId');

    // Init breadcrumbs for Reconcile Data and Mass match
    this.reconciliationBreadcrumbs = [
      <BreadCrumb>{ name: 'Setup', routerLink: 'setup' },
      <BreadCrumb>{ name: 'Reconcile Data', routerLink: 'reconcile-data' },
      <BreadCrumb>{ name: 'Define Layout', routerLink: 'define-layout' },
      <BreadCrumb>{ name: 'Map Match Codes', routerLink: 'map-matchcodes' },
      <BreadCrumb>{ name: 'Finalize Data', routerLink: 'finalize-data' }
    ];

    this.massMatchBreadcrumbs = [
      <BreadCrumb>{ name: 'Reconcile Data', routerLink: 'reconcile-data' },
      <BreadCrumb>{ name: 'Mass Match', routerLink: 'mass-match' },
      <BreadCrumb>{ name: 'View Matches', routerLink: 'view-matches', isDisabled: true }
    ];

    // Active breadcrumbs are set to reconciliation breadcrumbs by default
    this.activeBreadcrumbs = this.reconciliationBreadcrumbs;

    // Suscribe to router events to set breadcrumb based on current router state
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Setting active breadcrumbs to mass match if current route contains 'mass-match' or 'view-matches'
        if (event.url.match(/mass-match/g) || event.url.match(/view-matches/g) ) {
          this.activeBreadcrumbs = this.massMatchBreadcrumbs;
        } else {
          this.activeBreadcrumbs = this.reconciliationBreadcrumbs;
        }
      }
    });
  }
}
