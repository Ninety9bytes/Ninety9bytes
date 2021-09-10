
import {map} from 'rxjs/operators';

import { ApiService } from './api.service';
import { CountryDto } from '../dtos/country.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';

@Injectable()
export class CountryRepositoryService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  getAll(): Observable<Array<CountryDto>> {
    return this.apiService
      .get(`${this.configurationEndpoint}/Countries`).pipe(
      map(data => <Array<CountryDto>>data),
      map(data => {
        data.sort((a, b): number => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
        return data;
      }),);
  }
}
