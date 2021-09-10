import { Pipe } from '@angular/core';
import { PipeTransform } from '@angular/core';
import { ColumnMap } from '../../_models/column-map.model';

@Pipe({
  name: 'showAutoMapped',
  pure: false
})
export class ShowAutoMappedPipe implements PipeTransform {
  options = [];

  transform(values: Array<ColumnMap>, showAutoMapped: boolean) {
    const filtered = new Array<ColumnMap>();

    if (showAutoMapped) {
      return values;
    }

    if (!showAutoMapped) {
      values.forEach(col => {


        if (!col.isAutoMapped) {
          filtered.push(col);
        }
      });

      return filtered;
    }
  }
}
