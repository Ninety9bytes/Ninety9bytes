import { currencyDisplay } from '@telerik/kendo-intl/dist/es/main';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TemplateWizard } from '../../_models/template-wizard.model';
import { TemplateRepositoryService } from '../../_api/services/admin/template-repository.service';
import { OfficeRepositoryService } from '../../_api/services/office-repository.service';
import { ModuleRepositoryService } from '../../_api/services/module-repository.service';
import { TemplateFieldBaseDto } from '../../_api/dtos/template-management/template-field-base.dto';
import { FormLayout } from '../../_models/data-import/form-layout.model';
import { ModuleDto } from '../../_api/dtos/module.dto';
import { TemplateBaseDto } from '../../_api/dtos/template-management/template-base.dto';
import { OfficeDto } from '../../_api/dtos/office.dto';
import { ModuleFieldDto } from '../../_api/dtos/module-field.dto';
import { SetTemplateIsRetiredDto } from '../../_api/dtos/template-management/set-template-isretired.dto';

@Injectable()
export class TemplateService {
  private templateWizardSource = new BehaviorSubject<TemplateWizard>(<TemplateWizard>{ isEditingForGroup: false });

  public templateWizard$ = this.templateWizardSource.asObservable();

  constructor(
    private templateRepositoryService: TemplateRepositoryService,
    private officeRepositoryService: OfficeRepositoryService,
    private moduleRepositoryService: ModuleRepositoryService,
  ) {}

  layoutInProgress = new Array<TemplateFieldBaseDto>();
  moduleWithCustomLayout = new Array<string>();

  currentFormLayout: Array<Array<FormLayout>> = new Array<Array<FormLayout>>();

  selectedModules: Array<ModuleDto>;
  template: TemplateBaseDto;

  templateFormDirty = false;

  requiredModules = ['Main Profile'];

  groupId: string;
  getAll(): Observable<Array<TemplateBaseDto>> {
    return this.templateRepositoryService.getAll();
  }

  get(id: string): Observable<any> {
    return this.templateRepositoryService.get(id);
  }

  delete(id: string): Observable<any> {
    return this.templateRepositoryService.delete(id);
  }

  clone(sourceTemplate: TemplateBaseDto): Observable<TemplateBaseDto> {
    const clonedTemplate = <TemplateBaseDto>{
      id: sourceTemplate.id,
      officeId: sourceTemplate.officeId,
      name: `Copy ${sourceTemplate.name} ${Date.now()}`,
      isMasterTemplate: sourceTemplate.isMasterTemplate,
      isRetired: sourceTemplate.isRetired,
      sourceTemplateId: sourceTemplate.sourceTemplateId,
      templateFields: sourceTemplate.templateFields
    };

    return this.templateRepositoryService.create(clonedTemplate);
  }

  getOffices(): Observable<Array<OfficeDto>> {
    return this.officeRepositoryService.getAll();
  }

  getModules(): Observable<Array<ModuleDto>> {
    return this.moduleRepositoryService.getAll();
  }

  save(template: TemplateBaseDto): Observable<TemplateBaseDto> {
    // If we're updating an existing template
    if (template.id) {
      return this.templateRepositoryService.update(template);

      // Otherwise, create a new template
    } else {
      return this.templateRepositoryService.create(template);
    }
  }

  mapTemplateField(field: ModuleFieldDto, moduleId: string): TemplateFieldBaseDto {
    return <TemplateFieldBaseDto>{
      id: field.id,
      moduleId: moduleId,
      name: field.name,
      isRequired: field.isRequired,
      order: 0,
      moduleFieldId: field.id
    };
  }

  setIsRetired(templateId: string, isRetired: boolean): Observable<SetTemplateIsRetiredDto> {
    const retire = isRetired ? 'true' : 'false';
    return this.templateRepositoryService.retire(templateId, retire);
  }

  mapLayoutOrder(selectedModuleId: string, selectedFields: TemplateFieldBaseDto[]): FormLayout {
    const index = this.layoutInProgress.findIndex(c => c.moduleId === selectedModuleId);

    // Setting default order
    if (index === -1) {
      let count = 1;
      selectedFields.forEach(field => {
        field.order = field.isCustomField ? 0 : count;
        count++;
      });
    } else {
      selectedFields.forEach(field => {
        const fieldIndex = selectedFields.findIndex(c => c.id === field.id);
        const layoutIndex = this.layoutInProgress.findIndex(c => c.moduleFieldId === field.id);

        if (layoutIndex !== -1) {
          selectedFields[fieldIndex].order = this.layoutInProgress[layoutIndex].order;
        }
      });
    }

    const formLayout = <FormLayout>{
      moduleId: selectedModuleId,
      hasSelectedFields: selectedFields.length > 0,
      customFieldsAvailable: selectedFields.filter(c => c.isCustomField),
      evenOrderedFields: selectedFields
        .filter(c => c.order % 2 === 0)
        .sort((n1, n2) => n1.order - n2.order),
      oddOrderedFields: selectedFields
        .filter(c => c.order % 2 === 1)
        .sort((n1, n2) => n1.order - n2.order)
       
    };

    return formLayout;
  }

  saveLayout() {
    this.selectedModules.forEach(module => {
      const evenFields = this.currentFormLayout[module.id].evenOrderedFields;
      const oddFields = this.currentFormLayout[module.id].oddOrderedFields;

      // Saving selected order

      // Even order number fields
      let count = 2;
      evenFields.forEach(element => {
        const index = this.template.templateFields.findIndex(c => c.id === element.id);
        if (index !== -1) {
          this.template.templateFields[index].order = count;
        }
        count = count + 1;
      });
      // Odd order number fields
      count = 1;
      oddFields.forEach(element => {
        const index = this.template.templateFields.findIndex(c => c.id === element.id);
        if (index !== -1) {
          this.template.templateFields[index].order = count;
        }

        count = count + 1;
      });
    });
       this.layoutInProgress = this.template.templateFields;
  }

  updateTemplateWizard(groupId: string): void {
    const current = this.templateWizardSource.getValue();

    current.isEditingForGroup = groupId.length > 0;
    current.groupId = groupId;
    this.templateWizardSource.next(current);
  }

  resetTemplateWizard(): void {
    this.templateWizardSource.next(<TemplateWizard>{ isEditingForGroup: false });
  }
}
