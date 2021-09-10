import { UserStore } from './_core/user/user.store';
import { AuthenticationManager } from './_core/authentication/authentication.manager';
import { WindowManager } from './_core/services/window-manager.service';
import { ApiService } from './_api/services/api.service';
import { IdleTimeoutService } from './_core/services/idle-timeout.service';
import { ConfirmModalComponent } from './_shared/components/confirm-modal.component';
import { Component, OnInit, ViewContainerRef, LOCALE_ID, Inject, HostListener } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  languageLoaded = false;

  isBusy = false;

  userIsActive = undefined;

  isAuthError = undefined;
  
  constructor(
    private authenticationManager: AuthenticationManager,
    private configService: ConfigService,
    private userStore: UserStore,
    private translate: TranslateService,
    private container: ViewContainerRef,
    private windowManager: WindowManager,
    @Inject(LOCALE_ID) protected localeId: string,
    private apiService: ApiService,
    private _idleTimeoutService: IdleTimeoutService,
    private modalService: NgbModal
  ) {}

  @HostListener('window:scroll', ['$event'])
  doSomething(event) {

    // Prevent the page from scrolling to the bottom once a modal is opened.
    if (this.windowManager.isOpened()) {
      scrollTo(0, this.windowManager.scrollPosition);
    }
    this.windowManager.scrollPosition = window.pageYOffset;

  }

  ngOnInit(): void {
    const s = this;

    this.userStore.user.subscribe(user => {
      if (user) {
        this.userIsActive = user.permissions.permissionsGranted.length > 0;
      }
    });

    this.apiService.isBusy$.subscribe(isBusy => {
      this.isBusy = isBusy.length > 0;
    }, error => {
      this.isBusy = false;
    }, () => {
      this.isBusy = false;
    });

    this.windowManager.viewContainerRef = this.container;

    this.translate.setDefaultLang(this.configService.getSettings('defaultLanguage'));
    this.translate.use(this.configService.getSettings('defaultLanguage'));

    this.translate.onLangChange.subscribe(result => {

      this.languageLoaded = true;

    });


    this.translate.setDefaultLang(this.configService.getSettings('defaultLanguage'));

    this._idleTimeoutService.initialise();
    this.userStore.initializeAuthentication();
    this.authenticationManager.processAdalToken();

    this.authenticationManager.error.subscribe(errror=>
      {
        if(errror && errror.status == 403)
        {
    this.isAuthError = true;
        }
        else 
        {
          this.isAuthError = false;
        }
      });

    this._idleTimeoutService.PromptUserSessionEvent.subscribe((expireSeconds: number) => {
      const modal = this.modalService.open(ConfirmModalComponent);
      const modalOptions = this._idleTimeoutService.GetSessionTimeouModalOptions(expireSeconds);
      modal.componentInstance.options = modalOptions;
      modal.result.then(
        confirm => {
          this._idleTimeoutService.HandleExtendResult(true);
      },
      cancel => {this._idleTimeoutService.HandleExtendResult(false);
      });
    });
  }
}
