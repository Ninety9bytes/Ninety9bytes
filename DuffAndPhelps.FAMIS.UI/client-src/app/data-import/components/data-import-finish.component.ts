import { DataImportService } from '../services/data-import.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { OnInit, Component } from '@angular/core';
import { DataImport } from '../../_models/data-import.model';
import { ImportResultDto } from '../../_api/dtos/import-result.dto';
import { WizardService } from '../../_ui/services/wizard.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-import-finish',
  templateUrl: './data-import-finish.component.html'
})
export class DataImportFinishComponent implements OnInit, TranslatedComponent {

  i18n = TranslationBaseKeys;


  dataImport: DataImport;
  importResult: ImportResultDto = new ImportResultDto();
  isError: Boolean;
  groupId: string;
  constructor(private wizardService: WizardService, private dataImportService: DataImportService, private router: Router) {}

  ngOnInit() {
    this.dataImport = this.dataImportService.activeDataImport;
    this.importResult = this.dataImportService.importResult;
    this.isError = !this.dataImportService.importResult.success;

    if (!this.isError) {
      this.wizardService.activeTabs = [];
      this.wizardService.clearActiveTab();
    }
  }

  onSave(event: any) {
    this.wizardService.activeTabs = [];
    this.wizardService.clearActiveTab();
    this.dataImportService.resetPublicProperties();
    this.router.navigate([`/project-profile/${this.groupId}/MainProfile`]);
  }
  back(event) {
    event.preventDefault();
    this.wizardService.setActiveTab('step-2');
  }
}
