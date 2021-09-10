import { InsuranceApiService } from '../../_api/_runtime/services/insurance-api.service';
import { AdministrationService } from '../../project-profile/services/administration.service';
import { Injectable } from '@angular/core';
import { AssetSortTermDto } from '../../_api/dtos/inventory/asset-search.dto';
import { TransactionFilterTermDto } from '../../_api/_runtime/dtos/transaction-filter-term.dto';
import { TransactionsSearchFilter } from '../../_api/_runtime/dtos/transactions-search-filter.dto';
import { SortTerm } from '../../_api/_runtime/dtos/sort-term.dto';
import { TransactionsDto } from '../../_api/_runtime/dtos/transactions.dto';
import { Observable } from 'rxjs';
import { RevertSummaryDto } from '../../_api/_runtime/dtos/transaction-revert-summary.dto';

@Injectable()
export class TransactionsService {

  groupId: string = this.administrationService.groupId;
  public defaultSortTerms = [<AssetSortTermDto>{ termOrder: 0, sortDirection: 1, field: 'transactionDate' }];


  defaultTransactionFilterTerms: Array<TransactionFilterTermDto> = [{
    'term': {
        'field': 'PostingType',
        'value': '0'
      },
      'operation': 'eq'
    },
      {
    'term': {
      'field': 'PostingType',
        'value': '1'
    },
    'operation': 'eq'
  },
  {
    'term': {
      'field': 'PostingType',
        'value': '3'
    },
    'operation': 'eq'
  },
  {
    'term': {
      'field': 'PostingType',
        'value': '4'
    },
    'operation': 'eq'
  },
  {
    'term': {
      'field': 'PostingType',
        'value': '5'
    },
    'operation': 'eq'
  }];

  defaultSearchRequest = <TransactionsSearchFilter>{
    filterTerms: this.defaultTransactionFilterTerms,
    filterConjunction: 'or',
    sortTerms: [],
    skip: 0,
    take: 0
  };

  constructor(
    private insuranceApiService: InsuranceApiService,
    private administrationService: AdministrationService
  ) { }

  public updateTransactionsData(
    groupdId: string,
    skip: number,
    take: number,
    sortTerms: Array<SortTerm> = new Array<SortTerm>(),
    filterTerms: Array<TransactionFilterTermDto> = new Array<TransactionFilterTermDto>()
  ): Observable<TransactionsDto> {

    const searchRequest: TransactionsSearchFilter = {
      filterTerms: !!filterTerms && filterTerms.length > 0 ? filterTerms : this.defaultTransactionFilterTerms,
      filterConjunction: 'or',
      sortTerms: !!sortTerms && sortTerms.length > 0 ? sortTerms : this.defaultSortTerms,
      skip: skip,
      take: 0
    };

    return this.getSearchTransactionsByGroupId(groupdId, searchRequest);
  }

  public getRevertSummary(transactionId: string): Observable<RevertSummaryDto> {
    return this.insuranceApiService.getRevertSummary(transactionId);
  }

  public getSearchTransactionsByGroupId(groupdId: string,
    searchRequest: TransactionsSearchFilter): Observable<TransactionsDto> {

    return this.insuranceApiService.searchTransactionsByGroupId(groupdId, searchRequest);
  }

  public revertTransaction(transactionId: string): Observable<string> {
    return this.insuranceApiService.revertTransaction(transactionId);
  }

}
