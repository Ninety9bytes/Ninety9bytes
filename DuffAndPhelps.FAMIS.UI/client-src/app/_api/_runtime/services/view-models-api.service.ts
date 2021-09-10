import { FamisViewModelDto } from '../dtos/famis-view-model.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';

@Injectable()
export class ViewModelsApiService {
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  getSubProfileForGroup(groupId: string): Observable<FamisViewModelDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/ViewModels/SubProfile/${groupId}`);
  }

  getMainProfileForGroup(groupId: string): Observable<FamisViewModelDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/ViewModels/MainProfile/${groupId}`);
  }

  getDepreciationForGroup(groupId: string): Observable<FamisViewModelDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/ViewModels/Depreciation/${groupId}`);
  }
 
  getProcessingInstructionsForGroup(groupId: string): Observable<FamisViewModelDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/ViewModels/ProcessingInstructions/${groupId}`);
  }

  getProcessingShippingInstructionsForGroup(groupId: string): Observable<FamisViewModelDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/ViewModels/ShippingInstructions/${groupId}`);
  }

  // TODO: Implement ot copy-over remaining service methods

  // POST /api/ViewModels/MainProfile/{groupId}
  // POST /api/ViewModels/SubProfile/{groupId}
  // POST /api/ViewModels/ProcessingInstructions/{groupId}
  // POST /api/ViewModels/ShippingInstructions/{groupId}

}
