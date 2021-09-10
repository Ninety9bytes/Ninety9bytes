
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ConfigService } from '@ngx-config/core';
import { AdvancedMathOperator } from '../enums/advanced-math-operator';
import { Observable } from 'rxjs';

@Injectable()
export class CalculationApiService {

  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');

  constructor(private apiService: ApiService,
  private configService: ConfigService){}

  public Calculate(leftTerm: number, rightTerm: number, operator: AdvancedMathOperator): Observable<string>{
    return this.apiService.
    get(`${this.runtimeEndpoint}/QualityControl/Calculate?leftTerm=${leftTerm}&rightTerm=${rightTerm}&op=${operator}`).pipe(
    map(response => response.result));
  }

  public Prorate(leftNumerator: number, leftDenominator: number, rightNumerator: number): Observable<string>{
    return this.apiService.
    get(`${this.runtimeEndpoint}/QualityControl/Prorate?leftNumerator=${leftNumerator}&leftDenominator=${leftDenominator}` +
    `&rightNumerator=${rightNumerator}`).pipe(map(response => response.result));
  }

  public Allocate(value: number, numberOfItems: number): Observable<Array<string>>{
    return this.apiService.get(`${this.runtimeEndpoint}/QualityControl/Allocate?value=${value}&numberOfItems=${numberOfItems}`).pipe(
    map(response => response.result));
  }
}
