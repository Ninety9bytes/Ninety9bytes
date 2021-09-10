import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'evenodd'
})
export class EvenoddPipe implements PipeTransform {
  transform(value: any[], filter: string) {
    if (!value || (filter !== 'even' && filter !== 'odd')) {
      return value;
    }

    return value.filter(i => (filter === 'odd' ? i.order % 2 === 1 : i.order % 2 === 0));
  }
}
