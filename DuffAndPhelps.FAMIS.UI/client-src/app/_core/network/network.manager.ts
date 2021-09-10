import { HttpError } from './http-error.model';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NetworkManager {
    private errorCount = 0;
    private _error = new BehaviorSubject<HttpError|undefined>(undefined);
    public error = this._error.asObservable();

    public requests: number[] = [];

    public handleUnexpectedError(error: HttpError): void {
        if (this._error.getValue()) {
            this.errorCount++;
            // console.log(`Concurrent error count is ${this.errorCount}. Unacknowledgable error: `);
            // console.log(error);
        } else {
            this.errorCount = 1;
            this._error.next(error);
        }
    }

    public acknowledgeErrors(): void {
        this._error.next(undefined);
    }

    public logRequest(time: number): void {
        this.requests.push(time);
    }
}
