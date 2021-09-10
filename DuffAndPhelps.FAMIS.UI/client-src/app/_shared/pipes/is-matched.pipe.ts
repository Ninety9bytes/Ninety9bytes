import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'is-matched'
})
export class IsMatchedPipe implements PipeTransform {

  transform(id: any, matchedValues: any[]) {

    return matchedValues.find(c => c === id);

  }

}