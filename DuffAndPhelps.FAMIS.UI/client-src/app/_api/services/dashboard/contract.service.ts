
import {map, catchError} from 'rxjs/operators';

import { ApiService } from '../api.service';
import { ContractsGroupSummaryDto } from '../../dtos/shared/contracts-groups-summary.dto';
import { ContractSummaryDto } from '../../dtos/contract-summary.dto';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class ContractService {
  runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  minDate = moment.utc('1900-01-02');
  constructor(private apiService: ApiService, private configService: ConfigService) {}

  public getContractGroupsByGroupId(contractId: string, groupId: string): Observable<ContractsGroupSummaryDto> {
    return this.apiService.get(`${this.runtimeEndpoint}/contract/${contractId}/groups/${groupId}`);
  }

  public getContractsGroups(id: string): Observable<ContractsGroupSummaryDto[]> {
    return this.apiService.get(`${this.runtimeEndpoint}/contract/${id}/groups`);
  }

  public getContracts(): Observable<ContractSummaryDto[]> {
    return this.apiService
      .get(`${this.runtimeEndpoint}/contract/`).pipe(
      map(result =>
        result.map(dto => {
          const contract = <ContractSummaryDto>{
            id: dto.id,
            client: dto.client,
            opportunityName: dto.opportunityName,
            office: dto.office,
            country: dto.country,
            industry: dto.industry,
            projectCode: dto.projectCode,
            service: dto.service,
            billingDirector: dto.billingDirector,
            performingMd: dto.performingMd,
            groupIds: dto.groupIds,
            createdFromSalesforce: this.formatDateTime(dto.createdFromSalesforce)
          };
          return contract;
        })
      ))
      .pipe(catchError(err => {
        return [];
      }));
  }
  public formatDateTime(inputDate: string): string {
    if (!moment(inputDate).isValid() || moment.utc(inputDate).isBefore(this.minDate)) {
      return '';
    }
    return moment.utc(inputDate).format('MM/DD/YYYY hh:mm');
  }
}
