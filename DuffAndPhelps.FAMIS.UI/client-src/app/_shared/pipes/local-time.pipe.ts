import { Pipe, PipeTransform } from '@angular/core';
// import * as moment from 'moment';

import * as moment from 'moment-timezone';

@Pipe({
  name: 'localTime'
})
export class LocalTimePipe implements PipeTransform {
  userTimeZone = moment.tz.guess(true); // true - replaces cached value w/ the newly computed one
  minDate = moment.utc('1900-01-02');

  transform(dateString: string) {
    if (!moment(dateString).isValid() || moment.utc(dateString).isBefore(this.minDate)) {
      return '';
    }

    return moment
      .utc(dateString)
      .tz(this.userTimeZone)
      .format('LLL');
  }
}
