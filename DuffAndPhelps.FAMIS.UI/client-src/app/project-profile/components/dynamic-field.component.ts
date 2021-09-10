import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, switchMap, merge, catchError } from 'rxjs/operators';
import { PeoplePickerSearchResultDto } from '../../_api/dtos/project-profile/people-picker-search-result.dto';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';
import { PeoplePickerField } from '../../_models/field-types/people-picker-field.model';
import { ProjectProfileControlService } from '../../_api/services/project-profile/project-profile-control.service';
import { NgForm, FormGroup } from '@angular/forms';
import { ViewChild, Input, OnInit, Component } from '@angular/core';
import { BaseField } from '../../_models/field-types/base-field.model';

@Component({
  selector: 'profile-dynamic-field',
  templateUrl: './dynamic-field.component.html'
})
export class ProjectProfileDynamicFieldComponent implements TranslatedComponent, OnInit {

  i18n = TranslationBaseKeys;
  @Input()
  field = new BaseField<any>();
  @Input()
  form: FormGroup;

  @ViewChild('ngForm', {static: false})
  ngForm: NgForm;

  public searching = false;
  public searchFailed = false;
  public employeeSelected = false;
  public selectedEmployee: PeoplePickerSearchResultDto | undefined;
  hideSearchingWhenUnsubscribed = new Observable(() => () =>
    (this.searching = false)
  );
  public fieldValueString = '';

  constructor(
    private controlService: ProjectProfileControlService) {}

  ngOnInit(): void {
    if (this.field.value && this.field.controlType === 'peoplePicker') {
      const ppField = this.field as PeoplePickerField;
      this.selectedEmployee = <PeoplePickerSearchResultDto> {
        id : ppField.value,
        nameFormatted: ppField.displayValue
      };
      this.fieldValueString = ppField.displayValue;
    }
  }

  get isValid(): boolean {
    return this.form.controls[this.field.key] ? this.form.controls[this.field.key].valid : false;
  }

  public getResultFormatter(result: PeoplePickerSearchResultDto) {
    return result.nameFormatted;
  }

  public getInputFormatter(result: PeoplePickerSearchResultDto) {
    return result.nameFormatted;
  }

  public onSelectItem(event: NgbTypeaheadSelectItemEvent): void {
    this.employeeSelected = false;
    const employee: PeoplePickerSearchResultDto = event.item;
    this.selectedEmployee = employee;
    this.employeeSelected = true;
    this.fieldValueString = employee.nameFormatted;
    this.field['value'] = employee.id;
  }

  public search = (text$: Observable<string>) => (
    text$
    .pipe(debounceTime(300))
        .pipe(distinctUntilChanged())
        .pipe(tap(() => (this.searching = true)))
        .pipe(switchMap(term =>
            this.controlService
            .searchEmployee(term)
            .pipe(tap(() => {
                this.searchFailed = false;
            }))
            .pipe(catchError(() => {
                this.searchFailed = true;
                return of([]);
            })))
        )
        .pipe(tap(() => {
            this.searching = false;
        }))
        .pipe(merge(this.hideSearchingWhenUnsubscribed))
  )
}
