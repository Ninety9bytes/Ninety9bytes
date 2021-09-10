import { ApiService } from '../../services/api.service';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { CountryLanguageDto } from '../dtos/country-language.dto';
import { Observable } from 'rxjs';


@Injectable()
export class CountriesApiService {
  private configApiEndpoint = this.configService.getSettings('configurationApiEndpoint');
  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) { }

  public getCountryLanguage(countryCode: string): Observable<CountryLanguageDto> {
    return this.apiService.get(`${this.configApiEndpoint}/Countries/CountryLanguage?countryCode=${countryCode}`);
  }

}
