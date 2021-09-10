import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'view-map',
  templateUrl: './view-map.component.html'
})

export class ViewMapComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public longitude: number;
  public latitude: number;
  public buildingName: string;

  constructor(public windowManager: WindowManager) {}

  ngOnInit() {}

  public closeModalEvent() {
    this.windowManager.close();
  }
}
