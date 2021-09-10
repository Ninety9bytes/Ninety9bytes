import { ReconciliationConstants } from '../reconciliation.constants';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatchCodeCategory } from '../../_models/match-code-category.model';
import { MatchCode } from '../../_models/match-code.model';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { MatchCodesService } from '../../_api/services/reconciliation/match-codes.service';
import { WindowOption } from '../../_models/window-option';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'create-match-code',
  templateUrl: './create-match-code.component.html'
})
export class CreateMatchCodeComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  closeResult: string;
  matchCodeCategories = new Array<MatchCodeCategory>();

  matchCode = new MatchCode();
  @Output()
  onAddorUpdateMatchCode = new EventEmitter<any>();

  @ViewChild('content', {static: false})
  private content: any;

  title: string;
  action: string;
  startingName: string;

  isNameTaken: boolean;

  windowRef: WindowRef;

  constructor(
    private matchCodeService: MatchCodesService,
    private windowManager: WindowManager,
  ) {}

  open(event: any, id?: string) {
    event.preventDefault();

    if (id) {
      this.matchCodeService.getMatchCodeById(id).subscribe(mc => {
        this.matchCode = mc;
        this.title = 'Edit Match Code';
        this.action = 'Edit';
        this.startingName = mc.name;

        this.windowRef = this.windowManager.open(this.content, this.title, <WindowOption>{
          isModal: true,
          translationKey: this.i18n.reconciliation
        });
      });
    } else {
      this.matchCode = new MatchCode();
      this.title = 'Create New Match Code';
      this.action = 'Create';
      this.matchCode.isEnabled = true;

      this.windowRef = this.windowManager.open(this.content, this.title, <WindowOption>{
        isModal: true,
        translationKey: this.i18n.reconciliation
      });
    }

    this.isNameTaken = false;
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ngOnInit() {
    this.matchCodeService.getMatchCodeCategories().subscribe(categories => {
      if (categories == null || categories.length === 0) {
        this.matchCodeCategories = [];
      }

      this.matchCodeCategories = categories.filter(category => category.id !== ReconciliationConstants.SystemMatchCategoryId);
    });
  }

  onNameInputChange(event: any, nameVal: string) {
    event.preventDefault();
    if (this.action === 'Create') {
      this.isNameTaken =
        this.matchCodeService.cachedMatchCodes.find(x => x.name.toLowerCase() === this.matchCode.name.toLowerCase()) != null;
    }
    if (this.action === 'Edit') {
      if (nameVal !== this.startingName) {
        this.isNameTaken =
          this.matchCodeService.cachedMatchCodes.find(x => x.name.toLowerCase() === this.matchCode.name.toLowerCase()) &&
          this.matchCode.name.toLowerCase() !== this.startingName.toLowerCase();
      }
    }
  }

  onSubmit(form) {
    if (form.valid) {
      if (this.action === 'Create') {
        if (this.isNameTaken) {
          return;
        }
        this.matchCodeService.createMatchCode(this.matchCode).subscribe(createdMatchCode => {
          this.windowRef.close();

          this.onAddorUpdateMatchCode.emit(createdMatchCode);
        });
      } else {
        this.matchCodeService.updateMatchCode(this.matchCode).subscribe(editedMatchCode => {
          this.windowRef.close();

          this.onAddorUpdateMatchCode.emit(editedMatchCode);
        });
      }
    }
  }

  cancel(): void {
    this.windowRef.close();
  }
}
