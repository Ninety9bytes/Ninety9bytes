import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ProjectProfile } from '../../_models/project-profile.model';
import { FormView } from '../../_models/form-view';
import { ContractApiService } from '../../_api/_runtime/services/contract-api.service';
import { TemplatesApiService } from '../../_api/_configuration/services/templates-api.service';
import { ModulesApiService } from '../../_api/_configuration/services/modules-api.service';
import { ContractGroupDto } from '../../_api/dtos/contract-group.dto';
import { ContractGroupSummaryDto } from '../../_api/_runtime/dtos/contract-group-summary.dto';
import { TemplateBaseDto } from '../../_api/_configuration/dtos/template-base.dto';
import { ModuleDto } from '../../_api/_configuration/dtos/module.dto';

@Injectable()
export class ProjectProfileService {
  private projectProfileSource = new BehaviorSubject<ProjectProfile>(<ProjectProfile>{ selectedGroupId: null });
  public projectProfile$ = this.projectProfileSource.asObservable();

  // public modules: ModuleDto[];

  public selectedModuleId: string;

  // Observable string sources
  private selectedModuleSource = new Subject<FormView>();

  // Observable string streams
  selectedModule$ = this.selectedModuleSource.asObservable();

  constructor(
    private contractApiService: ContractApiService,
    private templateApiService: TemplatesApiService,
    private moduleApiService: ModulesApiService
  ) {}

  setSelectedModule(module: FormView) {
    this.selectedModuleSource.next(module);
  }

  public getContractGroup(id: string): Observable<ContractGroupDto> {
    return this.contractApiService.getContractGroup(id);
  }

  public getContractGroups(id: string): Observable<ContractGroupSummaryDto[]> {
    return this.contractApiService.getContractsGroups(id);
  }

  public updateProjectProfile(updated: ProjectProfile): void {
    this.projectProfileSource.next(updated);
  }

  public clearProjectProfile(): void {
    this.projectProfileSource.next(<ProjectProfile>{ selectedGroupId: null });
  }

  public getTemplateForGroup(groupId: string): Observable<TemplateBaseDto> {
    return this.templateApiService.GetTemplateForGroup(groupId);
  }

  public mapSelectedModules(template: TemplateBaseDto, modules: Array<ModuleDto>): Array<ModuleDto> {
    const s = this;

    const projectProfile = this.projectProfileSource.getValue();

    let enabledModules = new Array<ModuleDto>();

    if (projectProfile.modules) {
      const mappedSelectedModules = new Array<ModuleDto>();

      if (template.templateFields.length > 0) {
        const enabledModuleIds = template.templateFields.map(c => c.moduleId).filter(function(elem, i, array) {
          return array.indexOf(elem) === i;
        });

        const templateEnabledModules = <ModuleDto[]>projectProfile.modules.filter(function(x) {
          return enabledModuleIds.find(c => c === x.id);
        });

        const defaultModules = [
          <ModuleDto>{ name: 'Main Profile' },
          <ModuleDto>{ name: 'Administration' },
          <ModuleDto>{ name: 'Data Import' },
          <ModuleDto>{ name: 'Quality Control'},
          <ModuleDto>{ name: 'Header Management' },
        ];

        enabledModules = templateEnabledModules.concat(defaultModules);

        enabledModules.forEach(module => {
          const index = enabledModules.indexOf(module);

          if (index !== -1) {
            enabledModules[index] = s.mapModuleToComponent(enabledModules[index]);
          }
        });
      }
    }

    return enabledModules;
  }

  public getModules(): Observable<ModuleDto[]> {
    return this.moduleApiService.getAll();
  }

  private mapModuleToComponent(module: ModuleDto): ModuleDto {
    switch (module.name) {
      case 'Main Profile':
        module.componentName = 'MainProfile';
        module.menuOrder = 0;
        return module;

      case 'Sub-Profile':
        module.componentName = 'SubProfile';
        module.menuOrder = 1;
        return module;

      case 'Data Import':
        module.componentName = 'DataImport';
        module.menuOrder = 2;
        return module;

      case 'Reconciliation':
        module.componentName = 'Reconciliation';
        module.menuOrder = 3;
        return module;

      case 'Trending':
        module.componentName = 'Trending';
        module.menuOrder = 4;
        return module;

      case 'Depreciation':
        module.componentName = 'Depreciation';
        module.menuOrder = 5;
        return module;

      case 'Task Management':
        module.componentName = 'TaskManagement';
        module.menuOrder = 6;
        return module;

      case 'Quality Control':
        module.componentName = 'QualityControl';
        module.menuOrder = 7;
        return module;

      case 'Administration':
        module.componentName = 'Administration';
        module.menuOrder = 8;
        return module;

      case 'Header Management':
        module.componentName = 'HeaderManagement';
        module.menuOrder = 9;
        return module;
      case 'Recipients':
        module.componentName = 'Recipients',
        module.menuOrder = 10;
        return module;
      default:
      module.componentName = null;
      module.menuOrder = 0;
      return module;
    }
  }
  public logGroupandCheckOtherUser(id: string): Observable<boolean> {
    return this.contractApiService.logGroupandCheckOtherUser(id);
  }
}
