import { RecipientsService } from '../services/recipients.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'recipients',
  templateUrl: 'recipients.component.html'
})
export class RecipientsComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  constructor(
    private route: ActivatedRoute,
    private recipientsServices: RecipientsService
  ) { }

  ngOnInit() {
    this.recipientsServices.groupId = this.route.parent.snapshot.paramMap.get('groupId');
  }

  ngOnDestroy() {}

  public referenceDataLoaded(): boolean {
    return (
      !!this.recipientsServices.groupId
    );
  }

}
