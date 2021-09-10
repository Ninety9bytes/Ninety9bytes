import { TranslationManager } from '../../_core/i18n/translation-manager';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dynamicTranslate'
})
export class DynamicDataTranslation implements PipeTransform {
  constructor(private translateService: TranslationManager) {}

  transform(value: string): string {
    if (value) {
      const translationKeys = value.split('_');
      const translatedValue = this.translateService.instant(value);

      if (translationKeys.length > 1 && value.toLowerCase() === translatedValue) {
        return translationKeys[1];
      }

      return translatedValue;
    }
  }
}
