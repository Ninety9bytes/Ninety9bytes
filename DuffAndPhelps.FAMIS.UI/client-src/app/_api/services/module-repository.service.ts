import { ApiService } from './api.service';
import { ModuleDto } from '../dtos/module.dto';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from '@ngx-config/core';

@Injectable()
export class ModuleRepositoryService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  getAll(): Observable<Array<ModuleDto>> {
    return this.apiService.get(`${this.configurationEndpoint}/Modules`);
  }
}
