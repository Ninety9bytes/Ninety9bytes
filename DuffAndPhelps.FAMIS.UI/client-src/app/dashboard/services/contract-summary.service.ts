
import {map} from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ContractSummary } from '../../_models/contract-summary.model';
import { Injectable } from '@angular/core';
import { ContractService } from '../../_api/services/dashboard/contract.service';
import { GroupSummaryDto } from '../../_api/dtos/group-summary.dto';

@Injectable()
export class ContractSummaryService {
  constructor(private contractService: ContractService) {}

  getContractsGroups(id: string): Observable<GroupSummaryDto[]> {
    return this.contractService.getContractsGroups(id);


  }

  public getContracts(): Observable<ContractSummary[]> {
    return this.contractService.getContracts().pipe(map(result =>
      result.map(dto => {
        const contract = <ContractSummary>{
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
          createdFromSalesforce: dto.createdFromSalesforce
        };

        if(dto.groupIds.length > 0) {
          contract.primaryGroupId = dto.groupIds[0];
        }

        return contract;
      })
    ));
  }
  
}
