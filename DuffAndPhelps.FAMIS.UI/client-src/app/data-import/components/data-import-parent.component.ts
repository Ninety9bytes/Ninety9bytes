import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-import-parent',
  templateUrl: './data-import-parent.component.html',
})
export class DataImportParentComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  constructor(
    public dataImportService: DataImportService
  ) { }

  ngOnInit() {}
}
