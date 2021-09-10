import { FamisGridService } from '../../../_core/services/famis-grid.service';
import { GroupSaveService } from '../../services/group-save-service';
import { groupSaveHeaders, defaultGroupSaveHeaders } from '../default-values/default-header';
import { AlertService } from '../../../_core/services/alert.service';
import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { LocalTimePipe } from '../../../_shared/pipes/local-time.pipe';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { BreadCrumb } from '../../../_models/breadcrumbs.model';
import { RemoveDeactivatedService } from '../../services/remove-deactivated.service';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'remove-deactivated',
  templateUrl: './remove-deactivated.component.html'
})
export class RemoveDeactivatedComponent implements OnInit, OnDestroy, TranslatedComponent {

  i18n = TranslationBaseKeys;
  selectedType: any;
  selectedDatatarget: string;
  private destroyed$ = new Subject<any>();

  private defaultSkip = 0;
  private groupId: string;

  public saveClicked = false;
  breadCrumbs = [
    <BreadCrumb>{ name: 'Administration', routerLink: '../' },
    <BreadCrumb>{ name: 'Remove Deactivated', routerLink: 'RemoveDeactivated', isDisabled: true }
  ];

  constructor(
    private groupSaveService: GroupSaveService,
    private removeDeactivatedService: RemoveDeactivatedService,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.groupId = this.route.parent.snapshot.paramMap.get('groupId');
  }
  ngOnDestroy() {
    this.destroyed$.next();
  }
  onSubmit(form) {
    if (form.valid) {
    this.saveClicked = true;
     this.selectedDatatarget = this.selectedDatatarget === '' || this.selectedDatatarget === undefined ? '-1' : this.selectedDatatarget;
    // WIP
    // call the api method to execute the procedure
    this.removeDeactivatedService.RemoveDeactivatedItems(this.groupId, this.selectedType, this.selectedDatatarget).subscribe(result => {
          this.alertService.success('Deactivated items removed successfully');
          // this.alertService.error('Error removing deactivated items, please try again.');
    }, error => {
      this.alertService.error('Error removing deactivated items, please try again');
      this.resetForm(form);
    });
    this.saveClicked = false;
    }
  }
  private resetForm(form: NgForm) {

    this.selectedDatatarget = '';
    this.selectedType = '';
    form.resetForm();

  }
}
