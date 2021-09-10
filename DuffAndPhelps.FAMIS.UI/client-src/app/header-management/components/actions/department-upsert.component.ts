import { HeaderManagementService } from '../../services/header-management.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../../_core/services/window-manager.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { DepartmentDto } from '../../../_api/_runtime/dtos/department.dto';
import { WindowOption } from '../../../_models/window-option';

@Component({
  selector: 'department-upsert',
  templateUrl: './department-upsert.component.html'
})
export class DepartmentUpsertComponent implements OnInit, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public request = <DepartmentDto>{};
  public action: string;
  public isLoading = false;

  @ViewChild('content', { static: false }) private content: any; // Intentional -- following previous example

  @Output() onAddorUpdate = new EventEmitter<DepartmentDto>();
  @Output() onAction = new EventEmitter<string>();

  constructor(
    private headerManagementService: HeaderManagementService,
    public windowManager: WindowManager,
    private container: ViewContainerRef
  ) {}

  ngOnInit() {}

  open(item?: DepartmentDto) {
    let modalTitle = '';

    if (item) {
      this.action = 'Edit';
      Object.assign(this.request, item);
      modalTitle = 'Edit Department';
    } else {
      this.action = 'Add';
      this.request = <DepartmentDto>{};
      modalTitle = 'Add Department';
    }
    this.windowManager.open(this.content, modalTitle, <WindowOption>{
      isModal: true
    });
  }

  onSubmit(form) {
    if (form.valid) {
      if (this.action === 'Add') {
        this.headerManagementService.upsertDepartment(this.request, true).subscribe(result => {
          this.onAction.emit(this.action);
          this.onAddorUpdate.emit(result);
          this.windowManager.close();
        });
      }

      if (this.action === 'Edit') {
        this.headerManagementService.upsertDepartment(this.request, false).subscribe(result => {
          this.onAction.emit(this.action);
          this.onAddorUpdate.emit(result);
          this.windowManager.close();
        });
      }
    }
  }
}
