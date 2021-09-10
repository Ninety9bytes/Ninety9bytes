import { Pipe, PipeTransform } from '@angular/core';
import { IntlService } from '@progress/kendo-angular-intl';


@Pipe({
  name: 'localizedNumber'
})
export class LocalizedNumberPipe implements PipeTransform {
  constructor(private intlService: IntlService) {}

  transform(numberString: string) {
    return this.intlService.formatNumber(this.intlService.parseNumber(numberString), 'n');
  }
}
