
import {map} from 'rxjs/operators';
import { Authorization } from '../dtos/authorization.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { ApiService } from '../../services/api.service';
import { Observable } from 'rxjs';


@Injectable()
export class AuthorizationApiService {
  constructor(private configService: ConfigService, private apiService: ApiService) {}

  private authorizationApiEndpoint = this.configService.getSettings('authorizationApiEndpoint');

  public read(): Observable<Authorization> {
    const result: Observable<string[]> = this.apiService.get(`${this.authorizationApiEndpoint}/Authorization`);

    return result.pipe(map((data: string[]) => {
      const authorization: Authorization = {
        Roles: [],
        HasSubscription: false,
        SubscriptionId: null
      };

      for (const row of data) {
        if (row.indexOf('http://schemas.microsoft.com/ws/2008/06/identity/claims/role') > -1) {
          authorization.Roles.push(row.split(' : ')[1]);
        } else if (row.indexOf('DuffAndPhelps.HasSubscription') > -1) {
          authorization.HasSubscription = row.split(' : ')[1] === 'True';
        } else if (row.indexOf('DuffAndPhelps.Subscriptions') > -1) {
          authorization.SubscriptionId = row.split(' : ')[1];
        }
      }

      return authorization;
    }));
  }
}
