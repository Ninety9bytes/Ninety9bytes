import { LazyMapsAPILoaderConfigLiteral } from '@agm/core';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';

@Injectable()
export class GoogleMapsService implements LazyMapsAPILoaderConfigLiteral {
  public apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getSettings('googleMapAPIKey');
  }

}