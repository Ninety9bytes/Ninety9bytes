import { BaseField } from './field-types/base-field.model';
import { FormGroup } from '@angular/forms';

export interface FormView {
    id?: string;
    groupId?: string;
    name?: string;
    evenFields?: Array<BaseField<any>>;
    oddFields?: Array<BaseField<any>>;
    form?: FormGroup;
}