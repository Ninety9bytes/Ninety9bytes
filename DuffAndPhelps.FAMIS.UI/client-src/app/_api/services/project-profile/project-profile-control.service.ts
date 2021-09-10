
import {map} from 'rxjs/operators';
import { ApiService } from '../../services/api.service';
import { PeoplePickerSearchResultDto } from '../../dtos/project-profile/people-picker-search-result.dto';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { FormView } from '../../../_models/form-view';
import { ConfigService } from '@ngx-config/core';
import { BaseField } from '../../../_models/field-types/base-field.model';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Injectable()
export class ProjectProfileControlService {
  projectProfile: FormView;
  private runtimeEndpoint = this.configService.getSettings('runtimeApiEndpoint');
  constructor(
    private apiService: ApiService,
    private configService: ConfigService) {}

  toFormGroup(fields: BaseField<any>[]) {
    const group: any = {};

    fields.forEach(field => {
      group[field.key] = field.required
        ? new FormControl(field.value || '', Validators.required)
        : new FormControl(field.value || '');
    });
    return new FormGroup(group);
  }

  searchEmployee(searchTerm: string): Observable<PeoplePickerSearchResultDto[]> {
    if (searchTerm === '') {
      return of([]);
    }
    return this.apiService.get(`${this.runtimeEndpoint}/employees/search?query=${searchTerm}`).pipe(
    map(response => <PeoplePickerSearchResultDto[]>response));
  }

}
