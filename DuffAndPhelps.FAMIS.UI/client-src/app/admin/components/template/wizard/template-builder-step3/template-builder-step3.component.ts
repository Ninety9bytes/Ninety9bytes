import { TemplateService } from '../../../../services/template.service';
import { TranslatedComponent } from '../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../_core/i18n/translation-base-keys';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormLayout } from '../../../../../_models/data-import/form-layout.model';
import { ModuleDto } from '../../../../../_api/dtos/module.dto';
import { NgForm } from '@angular/forms';
import { DragulaService } from 'ng2-dragula';
import { WizardService } from '../../../../../_ui/services/wizard.service';
import { TemplateBaseDto } from '../../../../../_api/dtos/template-management/template-base.dto';

@Component({
  selector: 'app-template-builder-step3',
  templateUrl: './template-builder-step3.component.html'
})
export class TemplateBuilderStep3Component implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  // Dragula Options
  public options: any = {
    invalid(el, handle) {
      return el.tagname === 'H1';
    }
  };

  public formLayouts: Array<Array<FormLayout>> = new Array<Array<FormLayout>>();

  @Input() template: TemplateBaseDto = <TemplateBaseDto>{};
  @Input() modules: Array<ModuleDto>;
  @Input() selectedModules: Array<ModuleDto>;

  @ViewChild('dataImportForm', { static: true }) currentForm: NgForm;

  constructor(
    private templateService: TemplateService,
    private dragulaService: DragulaService,
    private wizardService: WizardService
  ) {}

  ngOnInit() {
    console.log(this.template);

    this.selectedModules.forEach(m => {
      const selectedModuleFields = this.template.templateFields.filter(c => c.moduleId === m.id && c.name.length > 0);

      this.formLayouts[m.id] = this.templateService.mapLayoutOrder(m.id, selectedModuleFields);
      // console.log('Form Layout');
      // console.log(this.formLayouts[m.id]);

      this.templateService.selectedModules = this.selectedModules;
      this.templateService.template = this.template;
      this.templateService.currentFormLayout = this.formLayouts;
    });

    this.dragulaService.dropModel().subscribe(value => {
      this.onDropModel(value.targetModel.slice(1));
    });
    this.dragulaService.removeModel().subscribe(value => {
      this.onRemoveModel(value.sourceModel.slice(1));
    });

    // END NG UPGRADE TWEAK

    this.currentForm.valueChanges.subscribe(() => {
      this.templateService.templateFormDirty = this.currentForm.dirty;
    });
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      // TODO: This is to prevent the cancel button from being clicked on 'enter pressed'
      event.preventDefault();
    }
  }

  onSubmit(form) {
    if (form.valid) {
      this.templateService.saveLayout();
      this.wizardService.setActiveTab('step-4');
    }
  }

  isModuleOnly(module: ModuleDto) {
    return module.moduleFields.some(c => c.dataType === 'Module');
  }

  navigateBack(event) {
    event.preventDefault();
    this.templateService.saveLayout();
    this.wizardService.setActiveTab('step-2');
  }

  private onDropModel(args) {
    const [el, target, source] = args;

    this.templateService.templateFormDirty = true;

    this.templateService.currentFormLayout = this.formLayouts;
  }

  private onRemoveModel(args) {
    const [el, source] = args;
  }
}
