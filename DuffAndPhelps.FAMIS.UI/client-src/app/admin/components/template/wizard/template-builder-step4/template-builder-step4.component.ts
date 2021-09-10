import { TemplateService } from '../../../../services/template.service';
import { AlertService } from '../../../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../_core/i18n/translation-base-keys';
import { Component, OnInit, Input } from '@angular/core';
import { FormLayout } from '../../../../../_models/data-import/form-layout.model';
import { ModuleDto } from '../../../../../_api/dtos/module.dto';
import { TemplateWizard } from '../../../../../_models/template-wizard.model';
import { WizardService } from '../../../../../_ui/services/wizard.service';
import { Router } from '@angular/router';
import { TemplateBaseDto } from '../../../../../_api/dtos/template-management/template-base.dto';

@Component({
  selector: 'app-template-builder-step4',
  templateUrl: './template-builder-step4.component.html'
})
export class TemplateBuilderStep4Component implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  moduleMapping: Array<any>;
  selectedFields: Array<any>;

  public formLayouts: Array<FormLayout> = new Array<FormLayout>();

  @Input() template: TemplateBaseDto = <TemplateBaseDto>{};
  @Input() modules: Array<ModuleDto>;
  @Input() selectedModules: Array<ModuleDto>;

  templateWizard: TemplateWizard;

  constructor(
    private templateService: TemplateService,
    private wizardService: WizardService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.templateService.templateWizard$.subscribe(templateWizard => {
      this.templateWizard = templateWizard;
    });

    this.selectedModules.forEach(m => {
      const selectedModuleFields = this.template.templateFields.filter(c => c.moduleId === m.id && c.name.length > 0);

      this.formLayouts[m.id] = this.templateService.mapLayoutOrder(m.id, selectedModuleFields);

      // console.log('Template ready to save');
      // console.log(this.template);
    });
  }

  onSubmit() {
    this.templateService.save(this.template).subscribe(data => {
      if (data === null) {
        this.alertService.error('An error occurred while saving the template.');
      } else {
        if (!this.templateWizard.isEditingForGroup) {
          this.templateService.templateFormDirty = false;

          this.router.navigateByUrl('/admin/templates');
          this.alertService.success('Template saved successfully!');
        } else {
          window.location.href = `/project-profile/${this.templateService.groupId}/MainProfile`;
        }
      }
    });
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      // TODO: This is to prevent the cancel button from being clicked on 'enter pressed'
      event.preventDefault();
    }
  }

  navigateBack(event) {
    event.preventDefault();
    this.wizardService.setActiveTab('step-3');
  }

  isModuleOnly(module: ModuleDto) {
    return module.moduleFields.some(c => c.dataType === 'Module');
  }
}
