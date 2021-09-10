import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CascadedSelectOption } from '../../_models/cascaded-select-option.model';

@Injectable()
export class DynamicFormControlService {
  private optionSource = new BehaviorSubject<Array<Array<CascadedSelectOption>>>(new Array<Array<CascadedSelectOption>>());

  public options$ = this.optionSource.asObservable();

  public updateOptions(id: number, options: Array<CascadedSelectOption>) {
    const current = this.optionSource.getValue();

    current[id] = options;

    this.optionSource.next(current);
  }

  constructor() {}
}
