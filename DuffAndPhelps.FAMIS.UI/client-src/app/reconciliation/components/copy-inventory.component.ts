import { ReconciliationInventoryService } from '../services/inventory.service';
import { ReconcileDataService } from '../services/reconcile-data.service';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SelectableSettings } from '@progress/kendo-angular-grid';

@Component({
  selector: 'copy-inventory',
  templateUrl: './copy-inventory.component.html'
})
export class CopyInventoryComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;
  @ViewChild('content', {static: false}) private content: any;
  private modalRef: NgbModalRef;

  public selectableSettings: SelectableSettings;

  @Output() onInventoryCopied = new EventEmitter<any>();

  title: string;
  action: string;

  availableGroups: any;

  selectedGroup = [];

  constructor(
    private modalService: NgbModal,
    private inventoryService: ReconciliationInventoryService,
    private reconcileDataService: ReconcileDataService
  ) {}

  ngOnInit() {

    this.inventoryService
      .getContractGroupsWithInventory(
        this.reconcileDataService.groupId
      )
      .subscribe(data => {
        this.availableGroups = data;

        // console.log(this.availableGroups);
      });

    this.setSelectableSettings();
  }

  public setSelectableSettings() {
    this.selectableSettings = {
      checkboxOnly: true,
      mode: 'single'
    };
  }

  open(event: any) {
    event.preventDefault();

    // this.customcolumn = new CustomColumn();
    this.title = 'Select Group to Copy Inventory From';
    this.action = 'Create';

    this.modalRef = this.modalService.open(this.content);
  }

  onSubmit(form) {

    this.inventoryService
      .copyInventoryToGroup(
        this.selectedGroup[0],
        this.reconcileDataService.groupId
      )
      .subscribe(result => {
        this.modalRef.dismiss();

        this.onInventoryCopied.emit(true);
      });
  }
}
