import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { WizardService } from '../../_ui/services/wizard.service';

@Component({
  selector: 'pros-renewal-wizard',
  templateUrl: './pros-renewal-wizard.component.html',
  // styleUrls: ['./pros-renewal-wizard.component.scss']
})
export class ProsRenewalWizardComponent implements  OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  subscription: Subscription;
  public activeTab: any;

  @ViewChild('prostabs', { static: false }) private tabs: NgbTabset;

  constructor(private wizardService: WizardService) {
    // subscribe to home component messages
    this.subscription = this.wizardService.activeTab$.subscribe(activeTab => {
      this.activeTab = activeTab;
      this.wizardService.activeTabs.push(activeTab);

      if (this.tabs) {
        // Setting timeout to wait for tab to be set to enabled
        setTimeout(() => {
          //
          this.tabs.select(activeTab);
        }, 100);
      }
    });
  }

  ngOnInit() { }

  public isActive(id) {
    return this.wizardService.activeTabs.indexOf(id) === -1;
  }
}
