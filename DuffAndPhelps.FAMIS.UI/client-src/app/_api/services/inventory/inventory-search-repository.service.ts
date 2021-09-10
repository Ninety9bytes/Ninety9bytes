
import {map} from 'rxjs/operators';
import { ApiService } from '../api.service';

import { FieldMetaDataDto } from '../../dtos/inventory/field-meta-data.dto';
import { SearchRequestDto } from '../../dtos/inventory/search-request.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { SearchResponseDto } from '../../dtos/inventory/search-response.dto';

@Injectable()
export class InventorySearchRepository {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private apiService: ApiService, private configService: ConfigService) {}

  search(dataTarget: number, groupId: string, excludeNullProps: boolean): Observable<FieldMetaDataDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/Inventory/${groupId}/SearchMetadata/${dataTarget}/${excludeNullProps}`).pipe(map(c => c.fields));
  }

  searchAssetsMassMatch(groupId: string, searchFilter: SearchRequestDto): Observable<SearchResponseDto> {
    return this.apiService.post(`${this.runtimeEndpoint}/Inventory/${groupId}/Assets/MassMatch`, searchFilter, null, true);
  }
}
