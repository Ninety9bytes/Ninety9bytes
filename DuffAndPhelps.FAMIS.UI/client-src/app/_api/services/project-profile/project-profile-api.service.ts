
import {map} from 'rxjs/operators';
import { ApiService } from '../api.service';
import { ProjectModuleDto } from '../../dtos/project-module.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { FamisViewModelDto } from '../../_runtime/dtos/famis-view-model.dto';

@Injectable()
export class ProjectProfileAPIService {

  private runtimeEndpoint: string;

      // Todo: Add form type to Module DTO returned from API i.e. TemplateBuilder form, Reconciliation, Task Builder etc...
      public modules = [
        <ProjectModuleDto>{ id: 'MainProfile', name: 'Main Profile', form: 'Dynamic' },
        <ProjectModuleDto>{ id: 'SubProfile', name: 'Sub Profile', form: 'Dynamic' },
        <ProjectModuleDto>{ id: 'DataImport', name: 'Data Import', form: 'DataImport' },
        <ProjectModuleDto>{ id: 'Reconciliation', name: 'Reconciliation', form: 'Reconciliation' },
        <ProjectModuleDto>{ id: 'Trending', name: 'Trending', form: 'Trending' },
        <ProjectModuleDto>{ id: 'Depreciation', name: 'Depreciation', form: 'Depreciation' },
        <ProjectModuleDto>{ id: 'TaskManagement', name: 'Task Management', form: 'TaskManagement' },
        <ProjectModuleDto>{ id: 'QualityControl', name: 'Quality Control', form: 'QualityControl' },
        <ProjectModuleDto>{ id: 'Administration', name: 'Administration', form: 'Administration' },
        <ProjectModuleDto>{ id: 'HeaderManagement', name: 'Header Management', form: 'HeaderManagement' }
      ];

  constructor(
    private apiService: ApiService,
    private configService: ConfigService
  ) {
    this.runtimeEndpoint = configService.getSettings('runtimeApiEndpoint');
  }

  get(moduleName: string, groupid: string): Observable<FamisViewModelDto> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/ViewModels/${moduleName}/${groupid}`).pipe(
      map(data => <FamisViewModelDto> data));
  }

  update(moduleName: string, groupid: string, viewModel: FamisViewModelDto): Observable<FamisViewModelDto> {
    return this.apiService
      .post(`${this.runtimeEndpoint}/ViewModels/${moduleName}/${groupid}`, viewModel).pipe(
      map(data => <FamisViewModelDto> data));
  }
}


