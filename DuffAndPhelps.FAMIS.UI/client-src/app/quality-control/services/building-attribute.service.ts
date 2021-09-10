import { HelperService } from '../../_core/services/helper.service';
import { BuildingAttributeFields } from '../components/building/form/form-models/primary-info/building-attributes-model';
import { of, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { BuildingDto } from '../../_api/_runtime/dtos/building.dto';
import { BuildingAttributeGridItemViewModel } from '../../_models/building-form.model';

@Injectable()
export class BuildingAttributeService {

  constructor() { }

  public initBuildingAdditions(
    building: BuildingDto): Observable<Array<BuildingAttributeGridItemViewModel>> {

    const dynamicAttributes = BuildingAttributeFields.sort(c => c.order);

    return of(dynamicAttributes);
  }

}
