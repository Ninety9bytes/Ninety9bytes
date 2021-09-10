import { PortalManagementService } from '../services/portal-management.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';

@Component({
  selector: 'setup-access',
  templateUrl: './setup-access.component.html'
})
export class SetupAccessComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @Input() group: GroupDto;

  constructor(private portalService: PortalManagementService) {}

  ngOnInit() {
    console.log(this.group);
  }

  ngOnDestroy() {

  }

  toggleStatus() {

    this.group.isDisabled = !this.group.isDisabled;
    this.portalService.updateGroup(this.group).subscribe(res => {

    });
  }
}
