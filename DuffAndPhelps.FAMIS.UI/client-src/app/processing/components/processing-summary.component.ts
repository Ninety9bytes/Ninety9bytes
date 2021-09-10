import { Component, OnInit, Input } from '@angular/core';
import { ProcessingService } from '../services/processing.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { ProcessingSummary } from '../../_models/processing/processing-summary.model';

@Component({
  selector: 'processing-summary',
  templateUrl: './processing-summary.component.html',
})
export class ProcessingSummaryComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() processingSummary: ProcessingSummary;

  constructor() { }

  ngOnInit() {
   // console.log(this.processingSummary.successfulRecords, this.processingSummary.errorRecords);
  }



}
