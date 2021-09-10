import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslationManager {
  private missingTranslations = {};

  constructor(private translateService: TranslateService) {}

  instant(key: string, params?: object): any {

    if (key.indexOf('no-translate_') !== -1) {
      return this.translateService.instant(key.split('_')[1], params);
    }

    const formattedBaseKey = key.toLowerCase().replace(/\s/g, '');

    let label = '';

    const keys = key.split('_');

    if (keys.length > 0) {
      label = keys[keys.length - 1];
    }

    const value = this.translateService.instant(formattedBaseKey, params);

    if (value.split('_').length > 1) {
      // String w/ '_' so its a missing translation
      this.missingTranslations[formattedBaseKey] = `${label}`;

      console.log(JSON.stringify(this.missingTranslations), 'Missing translations');
    }

    return value;
  }
}
