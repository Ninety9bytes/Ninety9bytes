import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { AlertService } from '../../../_core/services/alert.service';
import { WindowRef } from '@progress/kendo-angular-dialog/dist/es2015';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, Output, Input, EventEmitter } from '@angular/core';
import { WindowOption } from '../../../_models/window-option';

 @Component({
  selector: 'copy-asset-record-component',
  templateUrl: './copy-asset-record.component.html'
})
export class CopyAssetRecordComponent implements TranslatedComponent {
  i18n = TranslationBaseKeys;
   @Output() copyAssetRequested = new EventEmitter<void>();
   @Input() disabled: boolean;

  private windowRef: WindowRef;
  constructor(
    private windowManager: WindowManager,
  ) {}

  open(content) {
    this.windowRef = this.windowManager.open(content, 'Duplicate Record', <WindowOption>{
      isModal: true
    });
    this.windowRef.result.subscribe(result => {});
  }

  close() {
    if (this.windowRef) {
      this.windowRef.close();
    }
  }

  createCopy() {
    this.copyAssetRequested.emit();
    this.close();
  }
}
