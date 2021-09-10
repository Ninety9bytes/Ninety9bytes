
import {map} from 'rxjs/operators';

import {ApiService } from './api.service';
import { SupportedCustomColumnDataTypeDto } from '../dtos/shared/supported-custom-column-datatype.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomDataTypesRepository {

  constructor(private apiService: ApiService, private configService: ConfigService){}
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  configurationEndpoint = this.configService.getSettings('configurationApiEndpoint');

  getCustomColumnDataTypes(): Observable<Array<SupportedCustomColumnDataTypeDto>> {
    return this.apiService
      .get(`${this.configurationEndpoint}/ImportTemplates/CustomColumns/DataTypes`).pipe(
      map(data => <Array<SupportedCustomColumnDataTypeDto>> data));
  }


}