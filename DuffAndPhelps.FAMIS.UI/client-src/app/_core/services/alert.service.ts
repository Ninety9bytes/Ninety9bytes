import { TranslationBaseKeys } from '../i18n/translation-base-keys';
import { TranslationManager } from '../i18n/translation-manager';
import { Injectable } from '@angular/core';
import { Alert } from '../../_models/alert.model';
import { Subject, Observable } from 'rxjs';
import { Router, NavigationStart } from '@angular/router';
import { AlertType } from '../../_enums/alert-type';

@Injectable()
export class AlertService {
  private subject = new Subject<Alert>();
  private keepAfterRouteChange = false;
  private i18n = TranslationBaseKeys;

  constructor(private router: Router, private translationManager: TranslationManager) {
    // clear alert messages on route change unless 'keepAfterRouteChange' flag is true
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          // only keep for a single route change
          this.keepAfterRouteChange = false;
        } else {
          // clear alert messages
          this.clear();
        }
      }
    });
  }

  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  success(message: string, keepAfterRouteChange = false, params?: object) {
    this.alert(AlertType.Success, message, keepAfterRouteChange, params);
  }

  error(message: string, keepAfterRouteChange = false, params?: object) {
    this.alert(AlertType.Error, message, keepAfterRouteChange, params);
  }

  info(message: string, keepAfterRouteChange = false, params?: object) {
    this.alert(AlertType.Info, message, keepAfterRouteChange, params);
  }

  warn(message: string, keepAfterRouteChange = false, params?: object) {
    this.alert(AlertType.Warning, message, keepAfterRouteChange, params);
  }

  alert(type: AlertType, message: string, keepAfterRouteChange = false, params?: object) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.subject.next(<Alert>{ type: type, message: this.translateMessage(this.i18n.alert + message, params) });
  }

  clear() {
    // clear alerts
    this.subject.next();
  }

  private translateMessage(message: string, params?: object) {

    return this.translationManager.instant(message, params);

  }
}
