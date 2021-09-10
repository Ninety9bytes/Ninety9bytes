import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'localizedPercent'
})
export class LocalizedPercentPipe implements PipeTransform {

  transform(numberString: string) {
    return numberString ? `${Math.round(parseFloat(numberString))}%` : numberString;
  }
}
