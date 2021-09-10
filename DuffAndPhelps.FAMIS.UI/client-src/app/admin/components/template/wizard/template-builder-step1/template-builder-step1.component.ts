import { SimpleChanges, OnInit, OnChanges, Input, Output, ViewChild, EventEmitter, Component } from '@angular/core';
import { TemplateService } from '../../../../services/template.service';
import { TranslatedComponent } from '../../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../../_core/i18n/translation-base-keys';
import { TemplateWizard } from '../../../../../_models/template-wizard.model';
import { NgForm } from '@angular/forms';
import { TemplateUpdateEvent } from '../../../../../_models/events/template-update-event.model';
import { OfficeDto } from '../../../../../_api/dtos/office.dto';
import { WizardService } from '../../../../../_ui/services/wizard.service';
import { ModuleDto } from '../../../../../_api/dtos/module.dto';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateBaseDto } from '../../../../../_api/dtos/template-management/template-base.dto';

@Component({
  selector: 'app-template-builder-step1',
  templateUrl: './template-builder-step1.component.html'
})
export class TemplateBuilderStep1Component implements OnInit, OnChanges, TranslatedComponent {
  i18n = TranslationBaseKeys;

  errors: Object = {};
  isSubmitting = false;
  isDuplicate = false;

  templateWizard: TemplateWizard;

  form: NgForm;

  @Input() template: TemplateBaseDto;
  @Input() selectedModules: Array<ModuleDto>;
  @Input() modules: Array<ModuleDto>;
  @Input() offices: Array<OfficeDto>;
  @Input() templates: Array<TemplateBaseDto>;

  @Output() templateUpdated = new EventEmitter<TemplateUpdateEvent>();

  @ViewChild('dataImportForm', { static: true }) currentForm: NgForm;


  selectedModuleIds = new Array<string>();

  constructor(
    private templateService: TemplateService,
    private wizardService: WizardService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.templateService.templateWizard$.subscribe(templateWizard => {
      this.templateWizard = templateWizard;
    });

    this.currentForm.valueChanges.subscribe(() => {
      this.templateService.templateFormDirty = this.currentForm.dirty;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const s = this;
    if (changes.selectedModules) {
      const selectedModules = <Array<ModuleDto>>changes.selectedModules.currentValue;

      this.selectedModuleIds = selectedModules.filter(c => !c.isRequired).map(c => c.id);
    }
  }

  handleKeyDown(event: any) {
    if (event.keyCode === 13) {
      // TODO: This is to prevent the cancel button from being clicked on 'enter pressed'
      event.preventDefault();
    }
  }

  onSubmit(form) {
    if (this.isDuplicateName()) {
      this.isDuplicate = true;
    } else if (form.valid) {
      this.isDuplicate = false;
      const event = <TemplateUpdateEvent>{
        selectedModuleIds: this.selectedModuleIds.concat(this.modules.filter(c => c.isRequired).map(c => c.id)),
        template: this.template
      };

      this.templateUpdated.emit(event);

      this.wizardService.setActiveTab('step-2');
    }
  }

  onCancel(event: any) {
    event.preventDefault();

    if (!this.templateWizard.isEditingForGroup) {
      this.router.navigateByUrl('/admin/templates');
    } else {
      this.router.navigate([`/project-profile/${this.templateWizard.groupId}/MainProfile`]);
    }
  }

  onInputChange(event: any) {
    if (this.isDuplicate) {
      this.isDuplicate = false;
    }
  }

  private isDuplicateName(): Boolean {
    let res = false;
    this.templates.forEach(existingTemplate => {
      if (existingTemplate.name === this.template.name && existingTemplate.id !== this.template.id) {
        res = true;
        return;
      }
    });
    return res;
  }
}
