import { AlertService } from '../../_core/services/alert.service';
import { AuthenticationManager } from '../../_core/authentication/authentication.manager';
import { HttpErrorResponse, HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { IdleTimeoutService } from '../../_core/services/idle-timeout.service';
import { Observable, EMPTY, throwError, BehaviorSubject, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface HttpError {
  status: number;
  json: Function;
}

// TODO: Update this to have Observables of type T rather than type any
@Injectable()
export class ApiService {
  static timeoutValue: number;
  private _isBusy = new BehaviorSubject<Array<number>>([]);

  private readonly adalConfig = this.authManager.getAdalConfig();
  public isBusy$ = this._isBusy.asObservable();
  private defaultTimeoutValue = 15;

  constructor(
    private http: HttpClient,
    private authManager: AuthenticationManager,
    private alertService: AlertService,
    private router: Router) {
      sessionStorage.setItem('isTimerTriggered', 'false');
      sessionStorage.setItem('busyCounter', '0');
    }

  private addIsBusy(): number {
    const current = this._isBusy.getValue();
    const counter = parseInt(sessionStorage.getItem('busyCounter')) + 1;
    sessionStorage.setItem('busyCounter', counter.toString());
    const id = counter;
    current.push(id);
    this._isBusy.next(current);
    return id;
  }

  private removeIsBusy(id: number): void {
    const current = this._isBusy.getValue();
    const index = current.findIndex(c => c === id);
    if (index !== -1) {
      current.splice(index, 1);
      this._isBusy.next(current);
    }
  }

  public get(path: string, params: HttpParams = new HttpParams(), localErrorHandling = false): Observable<any> {
    const result = new Subject<any>();

    const id = this.addIsBusy();

    this.setHeaders(false).subscribe((headers: HttpHeaders) => {
      this.http
        .get(path, { headers: headers, params: params })
        .pipe(catchError(error => this.handleErrors(error, localErrorHandling, id)))
        .subscribe(
          (data: any) => {
            this.removeIsBusy(id);
            // moving it here before the API result is broadcasted to the subscribers but, has been receieved from over the network.
            result.next(data);
          },
          error => {
            result.error(error);
          },
          () => {
            this.removeIsBusy(id);
            result.complete();
          }
        );
    });

    return result;
  }

  public put(path: string, body: Object = {}, localErrorHandling: boolean = false): Observable<any> {
    const result = new Subject<any>();

    const id = this.addIsBusy();

    this.setHeaders().subscribe((headers: HttpHeaders) => {
      this.http
        .put(path, JSON.stringify(body), { headers: headers })
        .pipe(catchError(error => this.handleErrors(error, localErrorHandling, id)))
        .subscribe(
          (data: any) => {
            this.removeIsBusy(id);
            result.next(data);
          },
          error => {
            result.error(error);
          },
          () => {
            this.removeIsBusy(id);
            result.complete();
          }
        );
    });
    return result;
  }

  public patch(path: string, body: Object = {}, localErrorHandling: boolean = false): Observable<any> {
    const result = new Subject<any>();

    const id = this.addIsBusy();

    this.setHeaders().subscribe((headers: HttpHeaders) => {
      this.http
        .patch(path, JSON.stringify(body), { headers: headers })
        .pipe(catchError(error => this.handleErrors(error, localErrorHandling, id)))
        .subscribe(
          (data: any) => {
            this.removeIsBusy(id);
            result.next(data);
          },
          error => {
            result.error(error);
          },
          () => {
            this.removeIsBusy(id);
            result.complete();
          }
        );
    });
    return result;
  }

  public post(path: string, body: any, file?: File, localErrorHandling: boolean = false): Observable<any> {
    let dataToPost: FormData | string;
    let isFileUpload = false;

    const id = this.addIsBusy();

    if (file) {
      dataToPost = new FormData();
      dataToPost.append('file[]', file, file.name);
      isFileUpload = true;
    } else {
      dataToPost = JSON.stringify(body);
    }

    const result = new Subject<any>();

    this.setHeaders(isFileUpload).subscribe((headers: HttpHeaders) => {
      this.http
        .post(path, dataToPost, { headers: headers })
        .pipe(catchError(error => this.handleErrors(error, localErrorHandling, id)))
        .subscribe(
          (data: any) => {
            this.removeIsBusy(id);
            result.next(data);
          },
          error => {
            result.error(error);
          },
          () => {
            this.removeIsBusy(id);
            result.complete();
          }
        );
    });

    return result;
  }

  public delete(path: string, localErrorHandling: boolean = false): Observable<any> {
    const result = new Subject<any>();

    const id = this.addIsBusy();

    this.setHeaders().subscribe((headers: HttpHeaders) => {
      this.http
        .delete(path, { headers: headers })
        .pipe(catchError(error => this.handleErrors(error, localErrorHandling, id)))
        .subscribe(
          (data: any) => {
            this.removeIsBusy(id);
            result.next(data);
          },
          error => {
            result.error(error);
          },
          () => {
            this.removeIsBusy(id);
            result.complete();
          }
        );
    });

    return result;
  }

  private setHeaders(isFileUpload: boolean = false): Observable<HttpHeaders> {
    const result = new Subject<HttpHeaders>();
    const headersConfig = {};

    if (!isFileUpload) {
      headersConfig['Content-Type'] = `application/json`;
      headersConfig['Accept'] = `application/json`;
    } else {
      headersConfig['Accept'] = `application/json`;
    }

    // TODO: Handle error case (once this.authService.acccessToken handles error case)
    this.authManager.getToken(false, null).subscribe((token: string) => {
      headersConfig['Authorization'] = `Bearer ${token}`;
      result.next(new HttpHeaders(headersConfig));
      result.complete();
    });
    return result.asObservable();
  }

  private handleErrors(error: HttpErrorResponse, localErrorHandling: boolean, id: number) {

    this.removeIsBusy(id);

    if (!localErrorHandling || error.status === 403) {
      switch (error.status) {
        case 400:
          window.location.href = '/error/400';
          break;
        case 401:
          this.authManager.forgetAdal();
          window.location.href = '/error/401';
          break;
        case 403:
        this.authManager.handleAuthenticationError(error);
         //window.location.href = '/error/403';
         this.router.navigate(['/error/403'])
          break;
        case 404:
          window.location.href = '/error/404';
          break;
        case 409:
          window.location.href = '/error/409';
          break;
        case 458:
          this.databaseError(error);
          break;
        default:
          window.location.href = '/error/500';
          break;
      }
    }

    if (error.status === 458) {
      this.databaseError(error);
    }

    return throwError(error);
  }

  private databaseError(error: HttpErrorResponse) {
    if (!!error.error) {
      const errorMsgs = error.error.split('.');
      errorMsgs.forEach(msg => {
        if (msg.length > 1) {
          const result = msg.split(' ');
          const fieldName = result[2];
          const fieldLength = result[15];
          this.alertService.error('{{name}} has exceeded it\'s maximum length of {{length}}', null, {
            name: fieldName,
            length: fieldLength
          });
        }
      });
    }
  }
}
