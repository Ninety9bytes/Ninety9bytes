import { Injectable } from '@angular/core';
import { InsuranceApiService } from '../../../_api/_runtime/services/insurance-api.service';
import { TransactionRequestDto } from '../../../_api/_runtime/dtos/transaction-request.dto';
import { Observable } from 'rxjs';
import { TransactionResponseDto } from '../../../_api/_runtime/dtos/transaction-response.dto';

@Injectable()
export class QualityControlActionsService {

  constructor(
    private insuranceApiService: InsuranceApiService,
  ) { }

  public processTransaction(dto: TransactionRequestDto): Observable<TransactionResponseDto> {
    return this.insuranceApiService.createTransaction(dto);
  }
}
