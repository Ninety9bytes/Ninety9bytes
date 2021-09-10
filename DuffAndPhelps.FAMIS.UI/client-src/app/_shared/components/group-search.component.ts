import { debounceTime, distinctUntilChanged, tap, catchError, switchMap, merge } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Group } from '../../_models/group';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { GroupSearchService } from '../../_api/services/group-search.service';
import { GroupSearchResultDto } from '../../_api/dtos/group-search-result.dto';

@Component({
  selector: 'group-search',
  templateUrl: './group-search.component.html'
})
export class GroupSearchComponent implements OnInit {
  @Input() selectedGroup: any;
  @Input() includeContractSearch: boolean;
  @Output() selectGroup = new EventEmitter<Group>();

  model: any;
  searching: Boolean = false;
  searchFailed = false;
  item: NgbTypeaheadSelectItemEvent;
  hideSearchingWhenUnsubscribed = new Observable(() => () =>
    (this.searching = false)
  );

  constructor(private groupSearchService: GroupSearchService) {}

  ngOnInit() {
    if (this.includeContractSearch) {
      this.includeContractSearch = this.includeContractSearch;
    }
    if (this.selectedGroup) {
      this.groupSearchService.getGroup(this.selectedGroup).subscribe(group => {
        this.model = group;
      });
    }
  }

  onSelectItem(event: NgbTypeaheadSelectItemEvent): void {
    const group: GroupSearchResultDto = event.item;
    this.selectGroup.emit(group);
  }

  public getResultFormatter(result) {
    return result.groupName + ' (' + result.contractName + ')';
  }

  public getInputFormatter(result) {
    return result.groupName + ' (' + result.contractName + ')';
  }

search = (text$: Observable<string>) =>
    text$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(tap(() => (this.searching = true)))
      .pipe(switchMap(term =>
        this.groupSearchService
          .searchGroups(term, this.includeContractSearch)
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
