import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslationManager } from '../../_core/i18n/translation-manager';
import { WindowManager } from '../../_core/services/window-manager.service';
import { debounceTime, distinctUntilChanged, tap, catchError, switchMap, merge } from 'rxjs/operators';
import { of, Observable } from 'rxjs';
import { WindowOption } from '../../_models/window-option';
import { GroupTemplateDto } from '../../_api/_runtime/dtos/group-template.dto';
import { TemplatesApiService } from '../../_api/_configuration/services/templates-api.service';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service';
import { ViewContainerRef, ViewChild, Output, Input, EventEmitter, OnInit, Component } from '@angular/core';
import { TemplateDto } from '../../_api/_configuration/dtos/template.dto';
import { GroupTemplateRequestDto } from '../../_api/_runtime/dtos/group-template-request.dto';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'group-management-modal',
  templateUrl: './group-management-modal.component.html'
})
export class GroupManagementModalComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  @Input() contractId: string;
  @Input() groupNames: Array<string>;
  @Output() onAddorUpdateGroup = new EventEmitter<any>(); // Intentional -- following previous example
  @Output() onAction = new EventEmitter<string>();
  @ViewChild('content', { static: false }) private content: any; // Intentional -- following previous example

  uniqueNameError = false;
  selectedGroupName: string;
  originalGroupName: string;
  isLoading = false;
  request = <GroupTemplateRequestDto>{};
  action: string;
  model: TemplateDto;
  searching = false;
  searchFailed = false;
  item: NgbTypeaheadSelectItemEvent = null;
  hideSearchingWhenUnsubscribed = new Observable(() => () => (this.searching = false));
  currentGroupId = null;

  constructor(
    private windowManager: WindowManager,
    public container: ViewContainerRef,
    private groupApiService: GroupApiService,
    private templateService: TemplatesApiService,
    private translateService: TranslationManager,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentGroupId = this.route.parent.parent.snapshot.paramMap.get('groupId');
  }

  open(item?: GroupTemplateDto) {
    this.selectedGroupName = '';
    this.originalGroupName = '';
    this.uniqueNameError = false;

    if (item) {
      this.isLoading = true;
      this.action = 'Edit';
      this.request.groupName = item.groupName;
      this.originalGroupName = item.groupName;
      this.request.groupId = item.groupId;

      this.templateService.getTemplateById(item.templateId).subscribe(
        result => {
          this.model = result;
          this.request.templateId = result.id;
        },
        error => {},
        () => {
          this.isLoading = false;
        }
      );
    } else {
      this.action = 'Add';
      this.request.groupName = '';
      this.request.contractId = this.contractId;
      this.model = null;
      this.request.groupId = null;
      this.request.templateId = null;
    }

    this.windowManager.open(this.content, this.action, <WindowOption>{
      isModal: true
    });
  }

  onSubmit(form) {
    if (form.valid && !!this.request.templateId) {
      if (!(this.groupNames.some(x => x === this.request.groupName) && this.request.groupName !== this.originalGroupName)) {
        this.uniqueNameError = false;
        this.isLoading = true;
        if (!this.request.groupId) {
          this.request.groupId = this.currentGroupId;
        }
        if (this.action === 'Add') {
          this.groupApiService.createGroup(this.request).subscribe(
            result => {
              this.windowManager.close();
              this.onAction.emit(this.action);
              this.onAddorUpdateGroup.emit(result);
            },
            error => {},
            () => {
              this.isLoading = false;
            }
          );
        }

        if (this.action === 'Edit') {
          this.groupApiService.updateGroup(this.request).subscribe(
            result => {
              this.windowManager.close();
              this.onAction.emit(this.action);
              this.onAddorUpdateGroup.emit(result);
            },
            error => {},
            () => {
              this.isLoading = false;
            }
          );
        }
      } else {
        this.uniqueNameError = true;
        this.selectedGroupName = this.request.groupName;
      }
    }
  }

  /*** Typeahead  ***/
  // TODO -- update typeahead when api available
  onSelectItem(selected: NgbTypeaheadSelectItemEvent): void {
    this.request.templateId = selected.item.id;
  }

  public getResultFormatter(result) {
    return result.name;
  }

  public getInputFormatter(result) {
    return result.name;
  }

  search = (text$: Observable<string>) =>
    text$
      .pipe(debounceTime(300))
      .pipe(distinctUntilChanged())
      .pipe(tap(() => (this.searching = true)))
      .pipe(switchMap(term =>
        this.templateService
          .searchTemplate(term)
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
