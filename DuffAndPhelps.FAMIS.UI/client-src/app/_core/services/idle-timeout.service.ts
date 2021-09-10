import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { AuthenticationManager } from '../../_core/authentication/authentication.manager';
import { ModalProperties } from '../../_models/modal-properties.model';
import { TranslationBaseKeys } from '../i18n/translation-base-keys';

@Injectable()
export class IdleTimeoutService {
    i18n = TranslationBaseKeys;
    public timeoutExpired: Subject<number> = new Subject<number>();
    private readonly adalContext = this.authManager.getAdalContext();
    private defaultTimeoutValue: number = 15;
    private promptTime = 300; // 5 mins prior to session expiration.

    private elapsed = 0;
    private timerId: any;
    private expireTimeout: number;
    private isDialogOpen: boolean;
    public PromptUserSessionEvent: EventEmitter<number>;

    constructor(private authManager: AuthenticationManager) {
        this.PromptUserSessionEvent = new EventEmitter<number>();
    }

    public initialise() {
        this.startTimer();
        this.authManager.hasAnyAuth.subscribe(hasAuth => {
            if (hasAuth) {
                this.resetTimer();
            }
        });
        this.authManager.hasToken.subscribe(hasToken => {
            if (hasToken) {
                this.resetTimer();
            }
        });
        this.expireTimeout = this.adalContext.config ? this.adalContext.config.expireOffsetSeconds : this.defaultTimeoutValue;
    }

    public HandleExtendResult(isExtended: boolean) {
        if (isExtended) {
            this.authManager.getToken(true);
        } else {
            this.stopTimer();
            this.isDialogOpen = false;
            this.authManager.logoutAdal();
            this.authManager.logoutMsal();
        }
        this.isDialogOpen = false;
    }

    private stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }
    private startTimer() {
        this.timerId = setInterval(() => { this.timerTick(); } , 1000);
    }

    private resetTimer() {
        this.stopTimer();
        this.startTimer();
        this.elapsed = 0;
    }

    private timerTick() {
        ++this.elapsed;
        this.evaluateSessionTimeout();
    }

    private evaluateSessionTimeout() {
        if (this.isDialogOpen) { return; }

        if (this.elapsed < (this.expireTimeout - this.promptTime)) { return; }

        this.isDialogOpen = true;
        const mins = this.promptTime / 60;
        this.PromptUserSessionEvent.emit(Math.round(mins));
    }

    public GetSessionTimeouModalOptions(mins: number): ModalProperties {
        const options = <ModalProperties> {
            heading: {
                key: 'Your Session is About to Expire'
            },
            body: {
                key: 'Your current session will expire in {{expireMinutes}} minutes, would you like to extend your current session?',
                params: {expireMinutes: mins.toString()}
            },
            dismissText: {
                key: 'Log Out'
            },
            translateBaseKey: this.i18n.auth,
            successText: {
                key: 'Stay Logged in'
            }
        };
        return options;
    }
}
