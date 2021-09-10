import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';

@Injectable()
export class ConfigStatusApiService {
  private runtimeEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}
}
