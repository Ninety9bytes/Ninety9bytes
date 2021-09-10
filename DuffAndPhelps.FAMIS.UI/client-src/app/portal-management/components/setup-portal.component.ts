import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { Component, OnInit, OnDestroy, Input, OnChanges } from '@angular/core';
import { GroupDto } from '../../_api/_runtime/dtos/group.dto';
import { PortalSetupMode } from '../../_enums/portal-setup-mode';

@Component({
  selector: 'setup-portal',
  templateUrl: './setup-portal.component.html'
})
export class SetupPortalComponent implements OnInit, OnDestroy, TranslatedComponent, OnChanges {
  i18n = TranslationBaseKeys;
  @Input() group: GroupDto;

  public portalLabel: string;
  public setupModes = PortalSetupMode;
  public setupMode: PortalSetupMode = PortalSetupMode.SetupAccess;

  constructor() {}
  ngOnInit() {
    this.portalLabel = this.group.groupName;
  }
  ngOnChanges(){
    this.portalLabel = this.group.groupName;
  }
  ngOnDestroy() {}

  toggleSetupMode(mode: PortalSetupMode) {
    this.setupMode = mode;
  }
}
