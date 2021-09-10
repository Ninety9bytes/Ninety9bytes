
import {map} from 'rxjs/operators';

import {ApiService} from './api.service';
import {OfficeDto} from '../dtos/office.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';

@Injectable()
export class OfficeRepositoryService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) { }

  getAll(): Observable<Array<OfficeDto>> {
    return this.apiService
    .get(`${this.configurationEndpoint}/Offices`).pipe(
    map(data => <Array<OfficeDto>>data),
    map(data => {
      data.sort((a, b): number => {
        if (a.name < b.name){
          return -1;
        }
        if (a.name > b.name){
          return 1;
        }
        return 0;
      });
      return data;
    }),
    );
  }
}
