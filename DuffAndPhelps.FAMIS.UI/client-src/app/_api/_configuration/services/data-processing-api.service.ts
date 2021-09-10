
import {map} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { TrendingDto } from '../dtos/trending.dto';

@Injectable()
export class DataProcessingApiService {
  private runtimeEndpoint = this.configService.getSettings('configurationApiEndpoint');

  constructor(private configService: ConfigService, private http: HttpClient, private apiService: ApiService) {}
  
  public getTrending():Observable<TrendingDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/DataProcessing/trending`);
  }

  public getTrendingById(id: string):Observable<TrendingDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/DataProcessing/trending/${id}`);
  }

  public searchTrending(query: string):Observable<TrendingDto[]> {
    if (query === '') {
      return of([]);
    }

    return this.apiService.get(`${this.runtimeEndpoint}/DataProcessing/trending/search?query=${query}`).pipe(
      map(response => <TrendingDto[]>response));
  }

}