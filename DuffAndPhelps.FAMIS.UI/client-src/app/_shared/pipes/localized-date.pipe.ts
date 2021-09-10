import { Pipe, PipeTransform } from '@angular/core';
// import * as moment from 'moment';

import * as moment from 'moment-timezone';
import { IntlService } from '@progress/kendo-angular-intl';

@Pipe({
  name: 'localizedDate'
})
export class LocalizedDatePipe implements PipeTransform {
  constructor(private intlService: IntlService) {}

  minDate = moment.utc('1500-01-01');

  transform(dateString: string) {
    if (!moment(dateString).isValid() || moment.utc(dateString).isBefore(this.minDate)) {
      return '';
    }

    return this.intlService.formatDate(this.intlService.parseDate(dateString), 'd');
  }
}
