import { TemplateService } from '../../../services/template.service';

import { AlertService } from '../../../../_core/services/alert.service';
import { TemplateBuilderStep3Component } from './template-builder-step3/template-builder-step3.component';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ComponentCanDeactivate } from '../../../../_core/guards/component-can-deactivate';
import { CanDeactivateService } from '../../../../_core/guards/can-deactivate.service';
import { TranslatedComponent } from '../../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../../_core/i18n/translation-base-keys';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModuleDto } from '../../../../_api/dtos/module.dto';
import { OfficeDto } from '../../../../_api/dtos/office.dto';
import { Subscription } from 'rxjs';
import { TemplateFieldBaseDto } from '../../../../_api/dtos/template-management/template-field-base.dto';
import { TemplateUpdateEvent } from '../../../../_models/events/template-update-event.model';
import { WizardService } from '../../../../_ui/services/wizard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TemplateBaseDto } from '../../../../_api/dtos/template-management/template-base.dto';

@Component({
  selector: 'app-template-builder-wizard',
  templateUrl: './template-builder-wizard.component.html'
})
export class TemplateBuilderWizardComponent extends ComponentCanDeactivate implements OnDestroy, OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() editingTemplateForGroupId: string;
  @Input() groupId: string;

  modules: ModuleDto[] = new Array<ModuleDto>();
  offices: OfficeDto[] = new Array<OfficeDto>();
  subscription: Subscription;
  nameSubscription: Subscription;
  name = 'Create Template';

  selectedModules: ModuleDto[] = new Array<ModuleDto>();
  selectedModuleIds: string[] = new Array<string>();
  template = <TemplateBaseDto>{ templateFields: new Array<TemplateFieldBaseDto>() };
  templates: TemplateBaseDto[] = new Array<TemplateBaseDto>();
  templateId: string;

  isEditingForGroup = true;

  @ViewChild('tabs', { static: false }) private tabsControl: NgbTabset;
  @ViewChild('app-template-builder-step3', { static: false }) private step3CreateLayout: TemplateBuilderStep3Component;

  constructor(
    private wizardService: WizardService,
    private route: ActivatedRoute,
    router: Router,
    private templateService: TemplateService,
    private alertService: AlertService,
    private canDeactivateService: CanDeactivateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.wizardService.setActiveTab('step-1');

    this.templateService.groupId = this.groupId;

    this.templateService.layoutInProgress = new Array<TemplateFieldBaseDto>();
    this.templateService.moduleWithCustomLayout = new Array<string>();

    this.templateService.resetTemplateWizard();

    this.isEditingForGroup = !!this.groupId && this.groupId.length > 0;

    this.subscription = this.wizardService.activeTab$.subscribe(activeTab => {
      // console.log(activeTab);

      if (this.tabsControl) {
        // Setting timeout to wait for tab to be set to enabled
        setTimeout(() => {
          this.tabsControl.select(activeTab);
        }, 100);
      }
    });

    this.templateService.getOffices().subscribe(offices => {
      this.offices = offices;
    });

    this.templateService.getAll().subscribe(templates => {
      this.templates = templates;
    });

    this.templateService.getModules().subscribe(modules => {
      this.modules = modules;

      this.modules.forEach(module => {
        module.order = this.setOrder(module);
        module.isRequired = this.templateService.requiredModules.some(c => c === module.name);
      });

      let templateId = '';
      if (this.editingTemplateForGroupId) {
        this.templateService.updateTemplateWizard(this.groupId);
        templateId = this.editingTemplateForGroupId;
      } else {
        templateId = this.route.snapshot.paramMap.get('templateId');
      }

      this.name = templateId ? 'Edit Template' : 'Create Template';

      // Retrieve template to edit
      if (templateId) {
        this.templateService.get(templateId).subscribe(template => {
          this.template = template;

          this.selectedModules = this.mapSelectedModules(template);

          // console.log('Mapping template to edit');
          // console.log(template.templateFields);

          // Initialize saved layout
          this.templateService.layoutInProgress = template.templateFields;
          this.templateService.moduleWithCustomLayout = this.selectedModules.map(c => c.id);
        });
      }
    });
  }

  // Autosave Layout on tab change
  beforeChange($event: NgbTabChangeEvent) {
    if ($event.activeId === 'step-3') {
      this.templateService.saveLayout();
    }
  }

  public isActive(activeTab) {
    return this.wizardService.activeTabs.indexOf(activeTab) === -1;
  }

  canDeactivate(): boolean {
    return this.canDeactivateService.canDeactivateComponent(this.templateService.templateFormDirty);
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  onTemplateUpdated(event: TemplateUpdateEvent) {
    // console.log(event);

    if (event.template) {
      this.template = event.template;
    }
    if (event.selectedModuleIds) {
      this.selectedModules = new Array<ModuleDto>();

      event.selectedModuleIds.forEach(moduleId => {
        this.selectedModules.push(this.modules.find(c => c.id === moduleId));
      });
    }

    if (event.templateFields) {
      this.template.templateFields = event.templateFields;
    }
  }

  setOrder(module: ModuleDto): number {
    switch (module.name) {
      case 'Main Profile':
        return 1;
      case 'Sub-Profile':
        return 2;

      case 'Data Import':
        return 3;

      case 'Reconciliation':
        return 4;

      case 'Trending':
        return 5;

        case 'Depreciation':
        return 6;

      case 'Task Management':
        return 7;

      case 'Quality Control ':
        return 8;

      case 'Administration':
        return 9;

      case 'Processing Instructions':
        return 10;

      case 'Shipping Instructions':
        return 11;
    }
  }

  private mapSelectedModules(template: TemplateBaseDto): Array<ModuleDto> {
    const mappedSelectedModules = new Array<ModuleDto>();

    if (template.templateFields.length > 0) {
      const moduleIds = template.templateFields.map(c => c.moduleId).filter(function(elem, i, array) {
        return array.indexOf(elem) === i;
      });

      moduleIds.forEach(moduleId => {
        const index = this.modules.findIndex(c => c.id === moduleId);

        mappedSelectedModules.push(this.modules[index]);
      });
    }

    return mappedSelectedModules;
  }
}
