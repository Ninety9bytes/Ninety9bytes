import { PortalManagementService } from '../services/portal-management.service';
import { of, Observable } from 'rxjs';
import { catchError, tap, switchMap, distinctUntilChanged, debounceTime, merge } from 'rxjs/operators';
import { Component, Output, Input, OnInit, EventEmitter } from '@angular/core';
import { ContractSearchResultDto } from '../../_api/_runtime/dtos/contract-search-result.dto';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'contract-search',
  templateUrl: './contract-search.component.html'
})
export class ContractSearchComponent implements OnInit {

  @Output() selectContract = new EventEmitter<ContractSearchResultDto>();
  @Input() model: any;

  searching: Boolean = false;
  searchFailed = false;
  item: NgbTypeaheadSelectItemEvent;
  hideSearchingWhenUnsubscribed = new Observable(() => () =>
    (this.searching = false)
  );

  constructor(private portalService: PortalManagementService) {}

  ngOnInit() { }

  onSelectItem(event: NgbTypeaheadSelectItemEvent): void {
    const contract: ContractSearchResultDto = event.item;
    this.selectContract.emit(contract);
  }

  public getResultFormatter(result: ContractSearchResultDto) {
    return result.projectCode + ' (' + result.contractName + ')';
  }

  public getInputFormatter(result: ContractSearchResultDto) {
    return result.projectCode + ' (' + result.contractName + ')';
  }

  search = (text$: Observable<string>) =>
    text$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(tap(() => (this.searching = true)))
      .pipe(switchMap(term =>
        this.portalService
          .searchContracts(term)
          .pipe(tap(() => {
            this.searchFailed = false;
          }))
          .pipe(catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ))
      .pipe(tap(() => {
        this.searching = false;
      }))
      .pipe(merge(this.hideSearchingWhenUnsubscribed))
}
