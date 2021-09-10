import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserStore } from '../../_core/user/user.store';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { ConfigService } from '@ngx-config/core';
import { GroupApiService } from '../../_api/_runtime/services/group-api.service'

@Component({
  selector: 'support',
  templateUrl: './support.component.html',
})
export class SupportComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  public emailHref = '';
  public contactName = '';
  public contactEmail = '';
  public contactSubject = '';
  public contactMessage = '';
  public supportEmailAddress: string;
  private groupId: string;
  public groupName: string;
  constructor(
    private route: ActivatedRoute,
    private userStore: UserStore,
    private configService: ConfigService,
    private groupApiService: GroupApiService
    ) {

      this.supportEmailAddress = this.configService.getSettings('famisSupportEmailAddress');
    }

  ngOnInit(): void {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
    this.route.queryParams.subscribe((params) => this.contactSubject = params.subject);
        this.userStore.user.subscribe((user) => {
          this.contactName =   `${user.profile.FirstName} ${user.profile.LastName}`;
            this.contactEmail = user.profile.Email;
        });
    this.groupApiService.getContractGroup(this.groupId, false).subscribe(result => {
      if(result) {
        this.groupId = result.groupId;
        this.groupName = result.groupName;
      }
    });    
  }

  public updateEmail(): void {
    const message = this.contactMessage + '\n\n' + `Group Id: ${this.groupId}`+ '\n'+ `Group Name: ${this.groupName}` + '\n' + `Sent by ${this.contactName}` + '\n' + `${this.contactEmail}`;
    const body = encodeURI(message);

    this.emailHref = `mailto:${this.supportEmailAddress}?subject=${this.contactSubject}&body=${body}`;
}
}
