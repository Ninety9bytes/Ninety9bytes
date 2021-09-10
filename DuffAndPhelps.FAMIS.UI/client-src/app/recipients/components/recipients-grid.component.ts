import { FamisGridService } from '../../_core/services/famis-grid.service';
import { FamisGridComponent } from '../../_shared/components/famis-grid.component';
import { RecipientsInfoService } from '../../_core/services/recipients-info-service';
import { RecipientsService } from '../services/recipients.service';
import { UpsertRecipientComponent } from './actions/upsert-recipient.component';
import { AlertService } from '../../_core/services/alert.service';
import { RemoveRecipientComponent } from './actions/remove-recipient.component';
import { Deliverable } from '../../_api/_runtime/enums/recipient-deliverable';
import { recipientHeaders } from '../../processing/default-values/default-recipient-headers';
import { recipientFormModel } from '../form-models/recipients-form-model';
import { TranslatedComponent } from '../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../_core/i18n/translation-base-keys';
import { WindowManager } from '../../_core/services/window-manager.service';
import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { FamisGrid } from '../../_models/shared/famis-grid-state.model';
import { Subject, Subscription } from 'rxjs';
import { FormActionEvent } from '../../_models/form-action-event.model';
import { WindowRef } from '@progress/kendo-angular-dialog';
import { FormAction } from '../../_enums/form-action';
import { FamisGridActionEvent } from '../../_models/shared/famis-grid-action-event.model';
import { WindowOption } from '../../_models/window-option';
import { RecipientDto } from '../../_api/_runtime/dtos/recipient.dto';
import { FormGroup } from '@angular/forms';
import { FamisGridCacheResult } from '../../_models/shared/famis-grid-cache-result.model';

@Component({
  selector: 'recipients-grid',
  templateUrl: 'recipients-grid.component.html'
})
export class RecipientsGridComponent implements OnInit, OnDestroy, TranslatedComponent {
  i18n = TranslationBaseKeys;

  public recipientsGrid: FamisGrid;

  @ViewChild(FamisGridComponent, {static: false}) famisGrid: FamisGridComponent;

  private windowSize = 500;
  private destoryed$ = new Subject();

  constructor(
    private famisGridService: FamisGridService,
    private recipientsInfoService: RecipientsInfoService,
    private recipientsService: RecipientsService,
    private alertService: AlertService,
    private windowManager: WindowManager,
    private container: ViewContainerRef
  ) {}

  ngOnInit() {
    this.recipientsGrid = <FamisGrid>{
      height: 600,
      gridId: this.famisGridService.createGrid(),
      windowSize: this.windowSize,
      totalRecordCount: 0,
      name: '',
      supportedOperators: [],
      actions: ['Edit', 'Remove'],
      translationBaseKey: this.i18n.recipients
    };

    this.recipientsGrid.loading = this.recipientsService.getRecipientsByGroupId(this.recipientsService.groupId)
        .pipe(takeUntil(this.destoryed$))
        .subscribe((result) => {

      this.recipientsGrid.columnHeaders = recipientHeaders;
      this.recipientsGrid.selectedHeaders = this.recipientsInfoService.GetDefaultColumns();
      this.recipientsGrid.loading = this.processCacheUpdate();
    });

  }

  ngOnDestroy() {
    this.destoryed$.next();
  }

  onFormActionEvent(response: FormActionEvent, modal: WindowRef) {
    switch (response.action) {
      case FormAction.Save:
        this.save(response.formGroup, response.dto);
        break;
      case FormAction.Edit:
        this.edit(response.formGroup, response.dto);
        break;
      case FormAction.Remove:
        this.remove(response.formGroup, response.dto);
        break;
      case FormAction.Cancel:
        modal.close();
        break;
      default:
      throw new Error(`Action ${response.action} not implemented.`);
    }
    modal.close();
  }

  handleActionEvent(event: FamisGridActionEvent) {
    const parentThis = this;
    switch (event.action) {
      case 'Edit':
        const editRecipientModal = this.windowManager.open(UpsertRecipientComponent, 'Edit Recipient', <WindowOption> {
          isModal: true
        });

        editRecipientModal.content.instance.fieldMetaData = recipientFormModel;
        editRecipientModal.content.instance.recipientDto = event.item;
        editRecipientModal.content.instance.formAction = FormAction.Edit;
        editRecipientModal.content.instance.submitResponse.subscribe((response) => {
          parentThis.onFormActionEvent(response, editRecipientModal);
        });
        break;

      case 'Remove':
        const removeRecipientModal = this.windowManager.open(RemoveRecipientComponent, 'Remove Recipient',
        <WindowOption> {
          isModal: true

        });

        removeRecipientModal.content.instance.fieldMetaData = recipientFormModel;
        removeRecipientModal.content.instance.recipientDto = event.item;
        removeRecipientModal.content.instance.submitResponse.subscribe((response) => {
          parentThis.onFormActionEvent(response, removeRecipientModal);
        });
        break;
      default:
        break;
    }
  }

  addRecipient() {
    const parentThis = this;
    const addRecipientModal = this.windowManager.open(UpsertRecipientComponent, 'Add Recipient', <WindowOption> {
      isModal: true
    });

    addRecipientModal.content.instance.fieldMetaData = recipientFormModel;
    addRecipientModal.content.instance.formAction = FormAction.Save;
    addRecipientModal.content.instance.submitResponse.subscribe((response) => {
      parentThis.onFormActionEvent(response, addRecipientModal);
    });
  }


  save(form: FormGroup, recipientDto: RecipientDto) {
    recipientDto.zip = parseInt(recipientDto.zip.toString(), 10);
    if (form.valid) {
      this.recipientsService.createRecipient(this.recipientsService.groupId, recipientDto).subscribe(
        result => {
          // console.log(result);
          this.alertService.success('Recipient created successfully');
          this.updateCache();
        },
        error => {
          // console.log(error);
          this.alertService.error('An error has occurred in adding a recipient');
        },
        () => { }
      );
    }
  }

  edit(form: FormGroup, recipientDto: RecipientDto) {
    if (form.valid) {
      this.recipientsService.updateRecipient(recipientDto.id, this.recipientsService.groupId, recipientDto).subscribe(
        result => {
          // console.log(result);
          this.alertService.success('Recipient updated successfully');
          this.updateCache();
        },
        error => {
          // console.log(error);
          this.alertService.error('An error has occurred in updating a recipient');
        },
        () => { }
      );
    }
  }

  remove(form: FormGroup, recipientDto: RecipientDto) {

    if (form.valid) {
      this.recipientsService.deleteRecipient(recipientDto.id).subscribe(
        result => {
          this.alertService.success('Recipient removed successfully');
          this.updateCache();
        },
        error => {
          // console.log(error);
          this.alertService.error('An error has occurred in removing the recipient');
        },
        () => { }
      );
    }
  }


  updateCache(request?: FamisGridCacheResult) {
    this.recipientsGrid.cacheLoading = this.processCacheUpdate(request);
  }

  // Any is used because deliverables is being mapped from an array of objects to a flat string value
  private mapDeliverablesToString(dto: any): Array<RecipientDto> {
    return dto.map((field) => {
      field.deliverables = field.deliverables.map((deliverable): string => {
        return Deliverable[deliverable.deliverable];
      }).join(', ');
      return field;
    });
  }

  private processCacheUpdate(cacheUpdateRequest?: FamisGridCacheResult): Subscription {
    const s = this;

    return this.
      recipientsService.updateRecipientsData(
      this.recipientsService.groupId,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
        cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.take : s.famisGridService.defaultTake,
      )
      .subscribe(dto => {
        this.recipientsGrid.totalRecordCount = dto.length;

        s.famisGridService.setCacheRecords(
          this.mapDeliverablesToString(dto),
          s.recipientsGrid.gridId,
          cacheUpdateRequest ? cacheUpdateRequest.cacheWindow.skip : s.famisGridService.defaultSkip,
          dto.length,
          this.recipientsGrid.windowSize
        );
      });

  }
}
