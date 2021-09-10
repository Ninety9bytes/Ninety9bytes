import { ApiService } from '../../services/api.service';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthAccount } from '../dtos/account.dto';

@Injectable()
export class AccountApiService {
  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}

  private authorizationApiEndpoint = this.configService.getSettings('authorizationApiEndpoint');

  public read(): Observable<AuthAccount> {
    return this.apiService.get(`${this.authorizationApiEndpoint}/api/Account`);
  }
}
